import { ICacheManager, settings } from "@elizaos/core";
import { TW_KOL_1 } from "./social";

interface WatchItem {
    username: string;
    avatar: string;
    name: string;
    tags: [];
}

export interface UserProfile {
    userId: string;
    gmail?: string;
    agentname: string;
    bio?: string | string[];
    walletAddress?: string;
    wallets?: Record<string, string>;
    level: number;
    experience: number;
    nextLevelExp: number;
    points: number;
    tweetProfile?: {
        username: string;
        email: string;
        avatar?: string;
        code: string;
        codeVerifier: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    agentCfg?: {
        enabled: boolean;
        interval: string;
        imitate: string;
    };
    twitterWatchList: WatchItem[];
    tweetFrequency: {
        dailyLimit: number;
        currentCount: number;
        lastTweetTime?: number;
    };
    stats: {
        totalTweets: number;
        successfulTweets: number;
        failedTweets: number;
    };
    style?: {
        all: string[];
        chat: string[];
        post: string[];
    };
    adjectives?: string[];
    lore?: string[];
    knowledge?: string[];
    topics?: string[];
}

export interface TwitterScapData {
    username: string;
    timestamp: number;
    tweetsCount: number;
    followingCount: number;
    followingList: string[];
}

interface UserManageInterface {
    // Update profile for spec user
    updateProfile(profile: UserProfile);

    // Update WatchList for spec user
    updateWatchList(userId: string, list: WatchItem[]): void;

    // Get the watchlist for all users, and identified.
    getAllWatchList(): Promise<string[]>;

    // Save user profile data
    saveUserData(profile: UserProfile);

    getUserProfile(userId: string): Promise<UserProfile>;
    getAllUserProfiles(): Promise<UserProfile[]>;
}

export class UserManager implements UserManageInterface {
    static ALL_USER_IDS: string = "USER_PROFILE_ALL_IDS_";
    static USER_ID_SEQUENCE: string = "USER_PROFILE_ID_SEQUENCE_";
    static TWITTER_SCRAP_DATA: string = "TWITTER_SCRAP_DATA_";
    idSet = new Set();

    constructor(private cacheManager: ICacheManager) {}

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(key);
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(key, data, { expires: 0 }); //expires is NEED
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

    async updateProfile(profile: UserProfile) {
        if (profile) {
            await this.setCachedData(profile.userId, profile);
        }
    }

    updateWatchList(userId: string, list: WatchItem[]): void {
        throw new Error("Method not implemented.");
    }

    async getWatchList(userId: string): Promise<WatchItem[]> {
        // let watchList = new Set<string>();
        try {
            // // Get list by userId
            let userProfile = await this.getCachedData<UserProfile>(
                userId as string
            );
            // if (userProfile?.twitterWatchList) {
            //     for (const watchItem of userProfile.twitterWatchList) {
            //         watchList.add(watchItem.username);
            //     }
            // }
            if (userProfile?.twitterWatchList) {
                return Array.from(userProfile?.twitterWatchList);
            }
        } catch (error) {
            console.error(error);
        }
        return [];
    }

    async getAllWatchList(): Promise<string[]> {
        let watchList = new Set<string>();
        const defaultList = JSON.parse(settings.TW_KOL_LIST) || TW_KOL_1;
        for (const kol of defaultList) {
            watchList.add(kol);
        }
        const avoidList = JSON.parse(settings.TW_WATCHER_AVOID_LIST) || [];
        // Get All ids
        let idsStr = (await this.getCachedData(
            UserManager.ALL_USER_IDS
        )) as string;
        let ids = new Set(JSON.parse(idsStr));
        for (const userid of ids.keys()) {
            let userProfile = await this.getCachedData<UserProfile>(
                userid as string
            );
            if (userProfile && userProfile.twitterWatchList) {
                for (const watchItem of userProfile.twitterWatchList) {
                    if (avoidList.includes(watchItem.username)) {
                        continue; // skip avoid
                    }
                    watchList.add(watchItem.username);
                }
            }
        }
        console.log(watchList);
        return Array.from(watchList);
    }

    //
    async verifyExistingUser(userId: string): Promise<UserProfile> {
        const resp = await this.getCachedData<UserProfile>(userId);
        return resp;
    }

    async saveUserData(profile: UserProfile) {
        if (!profile) {
            return;
        }
        await this.setCachedData(profile.userId, profile);
        let idsStr = (await this.getCachedData(
            UserManager.ALL_USER_IDS
        )) as string;
        let ids = new Set(JSON.parse(idsStr));
        ids.add(profile.userId);
        await this.setCachedData(
            UserManager.ALL_USER_IDS,
            JSON.stringify(Array.from(ids))
        );
        this.idSet = ids;
    }

    // Get the user profile by userId
    async getUserProfile(userId: string): Promise<UserProfile> {
        if (!userId) {
            return null;
        }

        return await this.getCachedData<UserProfile>(userId);
    }

    // Add this new method to the class
    async getAllUserProfiles(): Promise<UserProfile[]> {
        // Get all user IDs
        const idsStr = (await this.getCachedData(
            UserManager.ALL_USER_IDS
        )) as string;
        if (!idsStr) {
            return [];
        }

        // Parse IDs array
        const ids = JSON.parse(idsStr);

        // Fetch all profiles using Promise.all for parallel execution
        const profiles = await Promise.all(
            ids.map(async (userId: string) => {
                return (await this.getCachedData(userId)) as UserProfile;
            })
        );

        // Filter out any null/undefined profiles
        return profiles.filter((profile) => profile != null);
    }

    createDefaultProfile(userId: string, gmail?: string): UserProfile {
        return {
            userId,
            gmail: gmail,
            agentname: "pod",
            bio: "",
            level: 1,
            experience: 0,
            nextLevelExp: 1000,
            points: 0,
            tweetProfile: {
                username: "",
                email: "",
                avatar: "",
                code: "",
                codeVerifier: "",
                accessToken: "",
                refreshToken: "",
                expiresIn: 0,
            },
            agentCfg: { enabled: false, interval: "24h", imitate: "elonmusk" },
            twitterWatchList: [],
            tweetFrequency: {
                dailyLimit: 10,
                currentCount: 0,
                lastTweetTime: Date.now(),
            },
            stats: {
                totalTweets: 0,
                successfulTweets: 0,
                failedTweets: 0,
            },
        };
    }

    // Check whether the profile is watched
    async isWatched(userId: string, twUsername: string): Promise<boolean> {
        const profile = await this.getCachedData<UserProfile>(userId);
        if (profile && profile.twitterWatchList) {
            return profile.twitterWatchList.some(
                (item) => item.username === twUsername
            );
        } else {
            return false;
        }
    }

    async getUserTwitterAccessTokenSequence(): Promise<{
        accessToken: string,
        refreshToken: string
    }> {
        // Get all user IDs
        let userId = "";
        let accessToken = "";
        let refreshToken = "";
        try {
            const idsStr = (await this.getCachedData(
                UserManager.ALL_USER_IDS
            )) as string;
            if (!idsStr) {
                return { accessToken, refreshToken };
            }
    
            let idSeq = (await this.getCachedData<number>(
                UserManager.USER_ID_SEQUENCE
            ));
            if (!idSeq) {
                idSeq = 0;
            }
    
            // Parse IDs array
            const ids = new Set(JSON.parse(idsStr));
            const idArray = Array.from(ids);
            if (idArray.length > 0) {
                if (idSeq >= idArray.length) {
                    idSeq = 0;
                }
                userId = idArray[idSeq] as string;
                let profile = await this.getUserProfile(userId);
                if (profile && profile.tweetProfile) {
                    accessToken = profile.tweetProfile.accessToken;
                    refreshToken = profile.tweetProfile.refreshToken;
                }
                else {
                    accessToken = "";
                    refreshToken = "";
                }
                let index = 0;
                while (!profile || !refreshToken) {
                    idSeq++;
                    if (idSeq >= idArray.length) {
                        idSeq = 0;
                    }
                    userId = idArray[idSeq] as string;
                    profile = await this.getUserProfile(userId);
                    if (profile && profile.tweetProfile) {
                        accessToken = profile.tweetProfile.accessToken;
                        refreshToken = profile.tweetProfile.refreshToken;
                    }
                    else {
                        accessToken = "";
                        refreshToken = "";
                    }
                    if (index++ > idArray.length) {
                        return { accessToken, refreshToken };
                    }
                }
                idSeq ++;
                await this.setCachedData(UserManager.USER_ID_SEQUENCE, idSeq);
            }
        }
        catch (error) {
            console.error(error);
        }
        return { accessToken, refreshToken };
    }

    async getTwitterScrapData(username: string): Promise<TwitterScapData> {
        try {
            const data = await this.getCachedData<TwitterScapData>(
                UserManager.TWITTER_SCRAP_DATA + username);
            if (data) {
                if (data.followingCount == null) {
                    data.followingCount = 0;
                }
                if (data.followingList == null) {
                    data.followingList = [];
                }
                return data;
            }
        }
        catch (error) {
            console.error(error);
        }
        console.log("getTwitterScrapData");
        return {
            username,
            timestamp: 0,
            tweetsCount: 0,
            followingCount: 0,
            followingList: []
        }
    }

    async setTwitterScrapData(username: string, timestamp: number,
        tweetsCount: number, followingCount: number, followingList: string[]) {
        try {
            const data = {
                username,
                timestamp,
                tweetsCount,
                followingCount,
                followingList
            };
            await this.setCachedData(
                UserManager.TWITTER_SCRAP_DATA + username,
                data
            );
        }
        catch (error) {
            console.error(error);
        }
    }
}
