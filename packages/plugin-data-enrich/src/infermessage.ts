// The define of AI Infer Message
import { IAgentRuntime, ICacheManager, settings } from "@elizaos/core";
import { TOP_TOKENS } from "./tokendata.ts";
import { TW_KOL_1, twitterDataProvider } from "./social.ts";
import * as path from "path";
import { Scraper } from "agent-twitter-client";

var TokenAlphaReport = [];
var TokenAlphaText = [];
const TOKEN_REPORT: string = "_token_report";
const TOKEN_ALPHA_TEXT: string = "_token_alpha_text";
const KOL_WATCH_ITEMS: string = "kol_watch_items";

//{ "token": "{{token}}", "interact": {{interact}}, "count": {{count}}, "event": {{event}} }
interface InferMessage {
    token: string;
    interact: string;
    count: number;
    event: Text;
}

interface WatchItem {
    kol: string; // twitter username
    token: string;
    title: string;
    updatedAt: string;
    text: string;
}

interface WatchItemsPage {
    items: WatchItem[];
    cursor: string;
    hasMore: boolean;
}

export class InferMessageProvider {
    private static cacheKey: string = "data-enrich/infermessage";
    private twProvider: twitterDataProvider = null;

    constructor(
        private runtime: IAgentRuntime,
        private scraper: Scraper
    ) {
        this.twProvider = new twitterDataProvider(runtime, scraper);
    }

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.runtime.cacheManager.get<T>(
            path.join(InferMessageProvider.cacheKey, key)
        );
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.runtime.cacheManager.set(
            path.join(InferMessageProvider.cacheKey, key),
            data,
            {
                expires: Date.now() + 24 * 60 * 60 * 1000 * 7, // a week
            }
        );
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        const fileCachedData = await this.readFromCache<T>(key);
        if (fileCachedData) {
            return fileCachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        await this.writeToCache(cacheKey, data);
    }

    private static getKolWatchItemsKey(kol: string): string {
        return `${KOL_WATCH_ITEMS}/${kol}`;
    }

    // Add WatchItems
    async addInferMessage(kol: string, input: string) {
        try {
            input = input.replaceAll("```", "");
            input = input.replace("json", "");
            let jsonArray = JSON.parse(input);

            if (jsonArray) {
                TokenAlphaReport = [];
                TokenAlphaText = [];

                const kolItems: WatchItem[] = [];

                for (const item of jsonArray) {
                    if (TOP_TOKENS.includes(item.token)) {
                        continue;
                    }
                    const existingItem = await this.getCachedData<InferMessage>(
                        item.token
                    );
                    if (existingItem) {
                        // Ensure count is a number
                        const existingCount =
                            typeof existingItem.count === "number"
                                ? existingItem.count
                                : 0;
                        item.count =
                            (typeof item.count === "number" ? item.count : 0) +
                            existingCount;
                        this.setCachedData(item.token, { ...item });
                        TokenAlphaReport.push(item);
                    } else {
                        this.setCachedData(item.token, { ...item });
                        TokenAlphaReport.push(item);
                    }

                    //let tokenInfo = "";//await this.enrichByWebSearch(item.token);
                    let tokenInfo = await this.twProvider.getAISummary(item.token);

                    let alpha: WatchItem = {
                        kol: kol,
                        token: item.token,
                        //title: `${item.interact}, total ${item.count} times`,
                        title: `${item.interact}`,
                        updatedAt: Date.now().toString(),
                        text: `${item.token}: ${item.event}\r\n\r\n ${tokenInfo}`,
                    };
                    kolItems.push(alpha);
                }

                await this.setCachedData(
                    InferMessageProvider.getKolWatchItemsKey(kol),
                    kolItems
                );

                this.setCachedData(TOKEN_REPORT, TokenAlphaReport);
                this.setCachedData(TOKEN_ALPHA_TEXT, TokenAlphaText);
            }
        } catch (error) {
            console.error("An error occurred in addMsg:", error);
        }
    }

    // Add Following changes WatchItems
    async addFollowingChangeMessage(kol: string, msg: string) {
        try {
            const kolItems: WatchItem[] = [];
            let alpha: WatchItem = {
                kol: kol,
                token: "Following",
                title: `@${kol} Following Changed`,
                updatedAt: Date.now().toString(),
                text: `@${kol} Following Changed ${msg}`,
            };
            kolItems.push(alpha);

            await this.setCachedData(
                InferMessageProvider.getKolWatchItemsKey(kol),
                kolItems
            );
        } catch (error) {
            console.error("An error occurred in addMsg:", error);
        }
    }

    async enrichByWebSearch(query: string) {
        const apiUrl = "https://api.tavily.com/search";
        const apiKey = settings.TAVILY_API_KEY;

        try {
            /*const prompt = [{
                "role": "system",
                "content":  `You are an Web3 & AI critical thinker research assistant.
                            Your sole purpose is to write well written, critically acclaimed,
                            objective and structured reports on given text.`
            }, {
                "role": "user",
                "content": `
                           'Using the above information, answer the following
                           query: "${query}" in a detailed report'`
            }]*/
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    query,
                    include_answer: true,
                }),
            });

            if (!response.ok) {
                //console.log(response);
                //throw new Error(`HTTP error! status: ${response}`);
                return "";
            }

            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.error("Error:", error);
        }
        return "";
    }

    static async getLatestReport(cacheManager: ICacheManager) {
        try {
            const report = await cacheManager.get<[InferMessage]>(
                path.join(InferMessageProvider.cacheKey, TOKEN_REPORT)
            );
            if (report) {
                try {
                    const json = JSON.stringify(report);
                    if (json) {
                        return json;
                    }
                } catch (error) {
                    console.error("Error fetching token data: ", error);
                }
                return report;
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
        return [];
    }

    static async getReportText(cacheManager: ICacheManager) {
        try {
            const report = await cacheManager.get<[WatchItem]>(
                path.join(InferMessageProvider.cacheKey, TOKEN_ALPHA_TEXT)
            );
            if (report) {
                try {
                    let index = Math.floor(Math.random() * (report.length - 1));
                    if (index < 0) {
                        index = 0;
                    }
                    const json = JSON.stringify(report[index]);
                    if (json) {
                        return json;
                    }
                } catch (error) {
                    console.error("Error fetching token data: ", error);
                }
            }
        } catch (error) {
            console.error("An error occurred in report :", error);
        }
        return "{}";
    }

    async getAlphaText() {
        try {
            const report =
                await this.getCachedData<[WatchItem]>(TOKEN_ALPHA_TEXT);
            if (report) {
                try {
                    const json = JSON.stringify(report[0]);
                    if (json) {
                        return json;
                    }
                } catch (error) {
                    console.error("Error fetching token data: ", error);
                }
                return report;
            }
        } catch (error) {
            console.error("An error occurred in apha:", error);
        }
        return "";
    }

    // 1. get WatchItems
    static async getWatchItemsByKol(
        cacheManager: ICacheManager,
        kol: string
    ): Promise<WatchItem[]> {
        const _post_key = InferMessageProvider.getKolWatchItemsKey(kol);
        const key = `${InferMessageProvider.cacheKey}/${_post_key}`;
        return (await cacheManager.get<WatchItem[]>(key)) || [];
    }

    // getKolList
    private static getKolList(specificKols?: string[]): string[] {
        if (specificKols) {
            return Array.isArray(specificKols) ? specificKols : [];
        }

        // settings.TW_KOL_LIST
        let settingsList = [];
        try {
            settingsList = JSON.parse(settings.TW_KOL_LIST || '[]');
        }
        catch (error) {
            console.log(error);
        }
        if (Array.isArray(settingsList) && settingsList.length > 0) {
            return settingsList;
        }

        // TW_KOL_1 as default
        return TW_KOL_1;
    }

    // getAllWatchItemsPaginated
    static async getAllWatchItemsPaginated(
        cacheManager: ICacheManager,
        cursor?: string
    ): Promise<WatchItemsPage> {
        const kolList = InferMessageProvider.getKolList();
        return InferMessageProvider.getWatchItemsPaginatedForKols(
            cacheManager,
            kolList,
            cursor
        );
    }

    // getWatchItemsPaginatedForKols
    static async getWatchItemsPaginatedForKols(
        cacheManager: ICacheManager,
        kols: string[],
        cursor?: string
    ): Promise<WatchItemsPage> {
        const kolList = InferMessageProvider.getKolList(kols);
        if (kolList.length === 0) {
            return {
                items: [],
                cursor: "",
                hasMore: false,
            };
        }

        const PAGE_SIZE = 30;

        // Initialize with first KOL's items
        let currentItemIndex = 0;

        if (cursor) {
            currentItemIndex = parseInt(cursor, 10);
            if (isNaN(currentItemIndex)) {
                currentItemIndex = 0;
            }
        }

        const items: WatchItem[] = [];
        let nextCursor = "";
        let hasMore = false;

        // Get all items from all KOLs
        const allItems: WatchItem[] = [];
        for (const kol of kolList) {
            const kolItems = await InferMessageProvider.getWatchItemsByKol(
                cacheManager,
                kol
            );
            allItems.push(...kolItems);
        }
        console.log(`All: ${allItems.length}`);

        // Slice items based on cursor
        console.log(currentItemIndex);
        const availableItems = allItems.slice(currentItemIndex);
        const itemsToTake = Math.min(PAGE_SIZE, availableItems.length);
        console.log(itemsToTake);
        items.push(...availableItems.slice(0, itemsToTake));

        // Set next cursor
        if (currentItemIndex + itemsToTake < allItems.length) {
            nextCursor = (currentItemIndex + itemsToTake).toString();
            hasMore = true;
        }

        return {
            items,
            cursor: hasMore ? nextCursor : "",
            hasMore,
        };
    }
}
