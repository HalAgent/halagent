// The define of AI Infer Message
import { ICacheManager } from "@elizaos/core";
import { TokenDataProvider, TOP_TOKENS } from "./tokendata.ts";
import * as path from "path";


var TokenAlphaReport = [];
var TokenAlphaText = [];
const TOKEN_REPORT: string = "_token_report";
const TOKEN_ALPHA_TEXT: string = "_token_alpha_text";

//{ "token": "{{token}}", "interact": {{interact}}, "count": {{count}}, "event": {{event}} }
interface InferMessage {
    token: string;
    interact: string;
    count: number;
    event: Text;
}

interface WatchItem {
    token: string;
    title: string;
    updateAt: string;
    text: string;
}

export class InferMessageProvider {
    private static cacheKey: string = "data-enrich/infermessage";

    constructor(
        private cacheManager: ICacheManager
    ) {
    }

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(InferMessageProvider.cacheKey, key)
        );
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(InferMessageProvider.cacheKey, key), data, {
            expires: Date.now() + 3 * 24 * 60 * 60 * 1000,
        });
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

    async addInferMessage(input: string) {
        try {
            input = input.replaceAll("```", "");
            input = input.replace("json", "");
            let jsonArray = JSON.parse(input);
            //console.log(`addInferMessage: ${jsonArray}`);
            if (jsonArray) {
                TokenAlphaReport = [];
                TokenAlphaText = [];
                // Merge results
                for (const item of jsonArray) {
                    const existingItem = await this.getCachedData<InferMessage>(item.token);
                    if (existingItem) {
                        // Merge interact & count
                        item.count += existingItem.count;
                        this.setCachedData(item.token, { ...item });
                        TokenAlphaReport.push(item);
                    } else {
                        if (!TOP_TOKENS.includes(item.token)) {
                            this.setCachedData(item.token, { ...item });
                            TokenAlphaReport.push(item);
                        }
                    }

                    if (true) {
                        let baseInfo = await TokenDataProvider.fetchTokenInfo(item.token);
                        //console.log(baseInfo);
                        let alpha: WatchItem = {
                            token: item.token,
                            title: `${item.interact}, total ${item.count} times`,
                            updateAt: new Date().toISOString().slice(0, 16).replace(/T/g, ' '),
                            text: `${item.token}: ${item.event} \n${baseInfo}`,
                            //text: `${item.token}: ${item.event}`,
                        }
                        TokenAlphaText.push(alpha);
                    }
                }
                //console.log(TokenAlphaText);
                this.setCachedData(TOKEN_REPORT, TokenAlphaReport);
                this.setCachedData(TOKEN_ALPHA_TEXT, TokenAlphaText);
            }
        } catch (error) {
            console.error("An error occurred in addMsg:", error);
        }
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
                    let index = Math.floor(
                        Math.random() * (report.length - 1)
                    );
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
            const report = await this.getCachedData<[WatchItem]>(TOKEN_ALPHA_TEXT);
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
}