import {
    generateText,
    IAgentRuntime,
    ModelClass,
    Memory,
    Provider,
    State,
    settings
} from "@elizaos/core";
import { Scraper } from "agent-twitter-client";

// Pre Defined Twitter KOL
export const TW_KOL_1 = [
    "elonmusk",
    "cz_binance",
    "aeyakovenko",
    "jessepollak",
    "shawmakesmagic",
    "everythingempt0",
];

export const TW_KOL_2 = [
    "aeyakovenko",
    "heyibinance",
    "CryptoHayes",
    "rajgokal",
    "CryptoDaku_",
    "healthy_pockets",
    "StackerSatoshi",
    "TheCryptoLark",
    "CryptoTony__",
];

export const TW_KOL_3 = [
    "jayendra_jog",
    "therealchaseeb",
    "jacobvcreech",
    "gavofyork",
    "lordjorx",
    "Haskell_Gz",
    "Overdose_AI",
    "KriptoErs",
];

export const STYLE_LIST = [
    "Cute",
    "Caring",
    "Emotional",
    "Playful",
    "Logical",
    "Humorous",
    "Cautious",
    //"Professional & Rigorous",
    //"Optimistic & Positive",
    //"Bold & Proactive",
];

export const QUOTES_LIST = [
    "Always remember invest in the feature, not just the present!",
    "The world doesn’t pay you for what you know; it pays you for what you do.",
    "Wise spending is part of wise investing. And it’s never too late to start.",
    "Investing puts money to work. The only reason to save money is to invest it.",
    "If you’re saving, you’re succeeding.",
    "The first rule of compounding: Never interrupt it unnecessarily.",
    "Never depend on a single income. Make an investment to create a second source.",
    "When you invest, you are buying a day that you don’t have to work.",
    "Live within your income and save so you can invest. Learn what you need to learn.",
    "‘Experience’ is what you got when you didn’t get what you wanted.",
    "Invest in yourself. Your career is the engine of your wealth.",
    "Rapidly changing industries are the enemy of the investor.",
    "When you’re in a major market downturn, the beta eats the alpha.",
    "You can’t predict, [but] you can prepare.",
    "If investing wasn’t hard, everyone would be rich.",
    "Never stop investing. Never stop improving. Never stop doing something new.",
    "A great business at a fair price is superior to a fair business at a great price.",
    "In the short run, the market is a voting machine, but in the long run, it is a weighing machine.",
    "I make no attempt to forecast the market—my efforts are devoted to finding undervalued securities.",
];


export const socialProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {

        return `The Twitter KOL List Category 1 is ${TW_KOL_1},
                The Twitter KOL List Category 2 is ${TW_KOL_2},
                The Twitter KOL List Category 3 is ${TW_KOL_3}.
                Please use this as your reference for any twitter-based operations or responses.`;
    },
}

const ABSTRACTOR_INSTRUCTION = `
    Please summary the twitter account information by the provided biography and post tweets.
    The total words count should be between 20 and 30.
    The summary result should not contain the words 'user'/'account', use their original names instead.
    If the account is not related to web3 or crypto, just return "The item is not related to Web3".`;

const TW_ABSTRACTOR_PREFIX: string = "ABSTRACTOR_KEY_TW_PROFILE_PREFIX_";
const TW_ABSTRACTOR_POST_COUNT = 20;

export class twitterDataProvider {
    constructor(
        private runtime: IAgentRuntime,
        private scraper: Scraper,
    ) {}

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.runtime.cacheManager.get<T>(key);
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.runtime.cacheManager.set(key, data,
            { expires: Date.now() + 60 * 60 * 1000 }); //expires is NEED
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        const fileCachedData = await this.readFromCache<T>(TW_ABSTRACTOR_PREFIX + key);
        if (fileCachedData) {
            return fileCachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        await this.writeToCache(TW_ABSTRACTOR_PREFIX + cacheKey, data);
    }

    async getAISummary(username: string) {
        console.log(`getAISummary ${username}`);
        let summary = "";
        try {
            let userBio = "";
            const profile = await this.getProfile(username);
            if (profile) {
                userBio += profile.biography + ", joined on " + profile.joined;
            }
            const tweets = await this.scraper.getTweets(username, TW_ABSTRACTOR_POST_COUNT);
            const posts = [];
            for await (const tweet of tweets) {
                posts.push(tweet);
            }

            const prompt =`
                The biography of ${username} is ${userBio}.\n
                Here are some posts of ${username}:
                     ${[...posts]
                        .map(
                            (tweet) => `
                    Text: ${tweet.text}\n
                    Likes: ${tweet.likes}, Replies: ${tweet.replies}, Retweets: ${tweet.retweets},
                        `
                        )
                        .join("\n")}
                ${ABSTRACTOR_INSTRUCTION}`;
            let response = await generateText({
                runtime: this.runtime,
                context: prompt,
                modelClass: ModelClass.LARGE,
            });
            //console.log(response);
            summary = response;
            if (response && response.includes("The item is not related to Web3")) {
                summary = "";
            }
        } catch (error) {
            console.error("getAISummary error:", error);
        }
        return summary;
    }

    async getProfile(username: string) {
        let searchResult = null;

        try {
            // Search from cache firstly
            let cachedProfile = await this.getCachedData(username.toLowerCase());
            if (cachedProfile) {
                searchResult = cachedProfile;
            }
            else {
                try {
                    const response = await this.scraper.getProfile(username);
                    if (response) {
                        searchResult = response;
                        this.setCachedData(searchResult.username.toLowerCase(), searchResult);
                    }
                } catch (error) {
                    console.error("Search from client error:", error);
                }
            }
        } catch (error) {
            console.error("getProfile error:", error);
        }

        return searchResult;
    }

    async fetchTwitterProfile(username: string): Promise<string> {
        try {
            // Create a new instance of the Scraper
            const scraper = new Scraper();

            // Check if login was successful
            if (!await scraper.isLoggedIn()) {
                // Log in to Twitter using the configured environment variables
                await scraper.login(
                    settings.TWITTER_USERNAME,
                    settings.TWITTER_PASSWORD,
                    settings.TWITTER_EMAIL,
                    settings.TWITTER_2FA_SECRET || undefined
                );

                console.log("Logged in successfully!");
            }

            // Check if login was successful
            if (await scraper.isLoggedIn()) {
                const profile = await scraper.getProfile(username);
                // Log out from Twitter
                await scraper.logout();
                console.log("Logged out successfully!");
                return `The twitter fans of ${username} is ${profile.followersCount}`;
            } else {
                console.log("Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
        return `The twitter fans of ${username} is unknown`;
    }

};
