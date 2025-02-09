// Find/Search Twitter Profile

import {
    IAgentRuntime
} from "@elizaos/core";
import {
    UserManager
} from "@elizaos/plugin-data-enrich";
import { ClientBase } from "./base";
import { twEventCenter } from "./index";


const TW_PROFILE_PREFIX: string = "FINDER_KEY_TW_PROFILE_PREFIX_";

export class TwitterFinderClient {
    client: ClientBase;
    runtime: IAgentRuntime;

    constructor(client: ClientBase, runtime: IAgentRuntime) {
        this.client = client;
        this.runtime = runtime;
    }

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.runtime.cacheManager.get<T>(key);
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.runtime.cacheManager.set(key, data, { expires: 0 }); //expires is NEED
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        const fileCachedData = await this.readFromCache<T>(TW_PROFILE_PREFIX + key);
        if (fileCachedData) {
            return fileCachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        await this.writeToCache(TW_PROFILE_PREFIX + cacheKey, data);
    }

    async start() {
        console.log("TwitterFinder start");
        if (!this.client.profile) {
            await this.client.init();
        }

        twEventCenter.on('MSG_SEARCH_TWITTER_PROFILE', async (data) => {
            console.log('Received message:', data);
            const profiles = await this.searchProfile(data.username, data.count, data.userId);
            // Send back
            twEventCenter.emit('MSG_SEARCH_TWITTER_PROFILE_RESP', profiles);
        });
    }

    async searchProfile(username: string, count: number, userId: string) {
        let profilesOutput = [];
        let searchResult = [];

        try {
            // Search from cache firstly
            let cachedProfile = await this.getCachedData(username.toLowerCase());
            if (cachedProfile) {
                searchResult.push(cachedProfile);
            }
            else {
                try {
                    const response = await this.client.twitterClient.searchProfiles(
                        username,
                        count
                    );
                    if (response) {
                        for await (const profile of response) {
                            searchResult.push(profile);
                            this.setCachedData(profile.username.toLowerCase(), profile);
                        }
                    }
                } catch (error) {
                    console.error("Search from client error:", error);
                }
            }

            const userManager = new UserManager(this.runtime.cacheManager);
            const alreadyWatchedList =
                await userManager.getWatchList(userId);
            const usernameSet = new Set<string>();
            if (alreadyWatchedList) {
                for (const item of alreadyWatchedList) {
                    const profile = {
                        isWatched: true,
                        username: item?.username,
                        name: item?.name,
                        avatar: item?.avatar,
                    };

                    if (item?.username) {
                        usernameSet.add(item.username);
                    }
                    profilesOutput.push(profile);
                }
            }

            for await (const profile of searchResult) {
                profile.isWatched = await userManager.isWatched(
                    userId,
                    profile.username
                );
                if (!profile.isWatched) {
                    profilesOutput.push(profile);
                }
            }
        } catch (error) {
            console.error("searchProfile error:", error);
        }

        return profilesOutput;
    }
}
