import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ICacheManager, settings } from "@elizaos/core";
import { messageCompletionFooter } from "@elizaos/core";
import * as path from "path";


// Pre Defined TOP Token
export const TOP_TOKENS = [
    "BTC",
    "ETH",
    "SOL",
    "BNB",
    "DOT",
    "@base",
    "base",
    "Base",
    "BASE",
    "solana",
    "Solana",
    "SOLANA",
    "bitcoin",
    "Bitcoin",
    "Ethereum",
];

export const tokenWatcherConversationTemplate =
    // {{goals}}
    `
# Instructions:
  Please response the input message, and also append some Web3/Token/Coin hot topic that related to the input for {{agentName}}.
`  + messageCompletionFooter;

const PROVIDER_CONFIG = {
    COINGECKO_API: "https://api.coingecko.com/api/v3/coins/",
    BIRDEYE_API: "https://public-api.birdeye.so",
    MAX_RETRIES: 2,
    RETRY_DELAY: 2000,
    TOKEN_SECURITY_ENDPOINT: "/defi/token_security?address=",
    TOKEN_TRADE_DATA_ENDPOINT: "/defi/v3/token/trade-data/single?address=",
};

export interface TokenGeckoBaseData {
    id: string;
    image: string; //image.small
    symbol: string
    homepage: string; //homepage[0]
    contract_address: string;
    market_cap_rank: string;
    twitter_followers: number; // community_data.twitter_followers
    watchlist_portfolio_users: number;
    tickers: string;
}

export interface TokenSecurityData {
    ownerBalance: string;
    creatorBalance: string;
    ownerPercentage: number;
    creatorPercentage: number;
    top10HolderBalance: string;
    top10HolderPercent: number;
}

export const topTokenProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {

        return `The Top/Famous Token List is ${TOP_TOKENS},
                Please use this as your reference for any twitter-based operations or responses.`;
    },
}

export class TokenDataProvider {
    private cacheKey: string = "data-enrich/tokens";

    constructor(
        private cacheManager: ICacheManager
    ) {
    }

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(this.cacheKey, key)
        );
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(this.cacheKey, key), data, {
            expires: Date.now() + 5 * 60 * 1000,
        });
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        // Check file-based cache
        const fileCachedData = await this.readFromCache<T>(key);
        if (fileCachedData) {
            return fileCachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Write to file-based cache
        await this.writeToCache(cacheKey, data);
    }

    private static async fetchWithRetry(
        url: string,
        options: RequestInit = {}
    ): Promise<any> {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: "application/json",
                        "x-chain": "solana",
                        "X-API-KEY": settings.BIRDEYE_API_KEY || "",
                        'x-cg-api-key': settings.GECKO_API_KEY || "",
                        ...options.headers,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `HTTP error! status: ${response.status}, message: ${errorText}`
                    );
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                lastError = error as Error;
                if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
                    const delay = PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i);
                    console.log(`Waiting ${delay}ms before retrying...`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        console.error(
            "All attempts failed. Throwing the last error:",
            lastError
        );
        throw lastError;
    }

    static async fetchTokenInfo(token: string): Promise<string> {
        let output = `**Token Data**\n`;
        output += `Token: ${token}\n\n`;
        token = token.replace('@', '');
        token = token.replace('$', '');
        console.log(`fetchTokenInfo: ${token}`);
        try {
            const data = await TokenDataProvider.fetchWithRetry(
                `${PROVIDER_CONFIG.COINGECKO_API}/${token}`,
                {}
            );

            if (data) {
                const baseData: TokenGeckoBaseData = {
                    id: data.id,
                    image: data.image?.small,
                    symbol: data.symbol,
                    homepage: data.links?.homepage[0],
                    contract_address: data.contract_address,
                    market_cap_rank: data.market_cap_rank,
                    twitter_followers: data.community_data?.twitter_followers,
                    watchlist_portfolio_users: data.watchlist_portfolio_users,
                    tickers: JSON.stringify(data.tickers?.length),
                };

                // Security Data
                output += `- Homepage: ${baseData.homepage}\n`;
                output += `- MarketCap Rank: ${baseData.market_cap_rank}\n`;
                output += `- Twitter Followers: ${baseData.twitter_followers}\n`;
                output += `- Watchlist Users: ${baseData.watchlist_portfolio_users}\n`;
                output += `- Tickers: ${baseData.tickers}\n\n`;
                output += `\n`;

                console.log("Formatted token data:", output);
                return output;
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        return "";
    }

    async fetchTokenSecurity(tokenSymbol: string): Promise<TokenSecurityData> {
        console.log(tokenSymbol);
        const url = `${PROVIDER_CONFIG.BIRDEYE_API}${PROVIDER_CONFIG.TOKEN_SECURITY_ENDPOINT}${tokenSymbol}`;
        const data = await TokenDataProvider.fetchWithRetry(url);
        console.log(data);

        if (!data?.success || !data?.data) {
            throw new Error("No token security data available");
        }

        const security: TokenSecurityData = {
            ownerBalance: data.data.ownerBalance,
            creatorBalance: data.data.creatorBalance,
            ownerPercentage: data.data.ownerPercentage,
            creatorPercentage: data.data.creatorPercentage,
            top10HolderBalance: data.data.top10HolderBalance,
            top10HolderPercent: data.data.top10HolderPercent,
        };
        console.log(`Token security data cached for ${tokenSymbol}.`);

        return security;
    }


    formatTokenData(tokenSymbol: string, data: TokenSecurityData): string {
        let output = `**Token Security Report**\n`;
        output += `Token Address: ${tokenSymbol}\n\n`;

        // Security Data
        output += `**Ownership Distribution:**\n`;
        output += `- Owner Balance: ${data.ownerBalance}\n`;
        output += `- Creator Balance: ${data.creatorBalance}\n`;
        output += `- Owner Percentage: ${data.ownerPercentage}%\n`;
        output += `- Creator Percentage: ${data.creatorPercentage}%\n`;
        output += `- Top 10 Holders Balance: ${data.top10HolderBalance}\n`;
        output += `- Top 10 Holders Percentage: ${data.top10HolderPercent}%\n\n`;
        output += `\n`;

        console.log("Formatted token data:", output);
        return output;
    }

    async getFormattedTokenSecurityReport(tokenSymbol: string): Promise<string> {
        try {
            console.log("Generating formatted token security report...");
            const processedData = await this.fetchTokenSecurity(tokenSymbol);
            return this.formatTokenData(tokenSymbol, processedData);
        } catch (error) {
            console.error("Error generating token security report:", error);
            return "Unable to fetch token information. Please try again later.";
        }
    }
}

const tokendataProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {
        try {
            const provider = new TokenDataProvider(
                _runtime.cacheManager
            );
            let tokenSymbol = _message?.content?.text;

            return provider.getFormattedTokenSecurityReport(tokenSymbol);
        } catch (error) {
            console.error("Error fetching token data:", error);
            return "Unable to fetch token information. Please try again later.";
        }
    },
};
export { tokendataProvider };
