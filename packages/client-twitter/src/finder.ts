// Find/Search Twitter Profile

import {
    IAgentRuntime
} from "@elizaos/core";
import {
    UserManager
} from "@elizaos/plugin-data-enrich";
import { ClientBase } from "./base";
import { twEventCenter } from "./index";
import fs from 'fs';
import path from 'path';
import {Level} from 'level';

const TW_PROFILE_PREFIX: string = "FINDER_KEY_TW_PROFILE_PREFIX_";
const db_kol_following = new Level('./mydb_kol_profile_following');
const db_kol_profile_list = new Level('./mydb_kol_profile_list');

export class TwitterFinderClient {
    client: ClientBase;
    runtime: IAgentRuntime;
    kolNameLabelDic: Map<string, string> = new Map();
    kolToFollowingSet: Set<string> = new Set();
    twitterKolUsers: string[] = [
        '0xRodney',
        'Buddy',
        'DavidAirey',
        'alex_fazel',
        'JoshRMeier',
        'coinbureau',
        'lukebelmar',
        'IvanOnTech',
        'Ashcryptoreal',
        'VirtualBacon0x',
        'LadyofCrypto1',
        'milesdeutscher',
        'crypto_banter',
        'Pentosh1',
        'kyledoops',
        'MarioNawfal',
        'dingalingts',
        'rektfencer',
        'JoeParys',
        'LMECripto',
        'AltcoinDailyio',
        'ExitLiqCapital',
        'CryptoGodJohn',
        'CryptoZachLA',
        'BrianDEvans',
        'scottmelker',
        'DaanCrypto',
        'Axel_bitblaze69',
        'CryptoDaku_',
        'healthy_pockets',
        'StackerSatoshi',
        'TheCryptoLark',
        'CryptoTony__',
        'EricCryptoman',
        'noBScrypto',
        'TheDustyBC',
        'Defi_Shiller1',
        'KrugerSays',
        'Fabian',
        'boxmining',
        'Bayc364',
        'LouisCooper_',
        'AltcoinSherpa',
        'MasonVersluis',
        'megbzk',
        'AltCryptoGems',
        'resdegen',
        'docXBT',
        'cruzcontrol660',
        'BlocksNThoughts',
        'SecretoDefi',
        'PastanagaCrypto',
        'LexMorenoWeb3',
        'b_block_oficial',
        'lordjorx',
        'Haskell_Gz',
        'Overdose_AI',
        'KriptoErs',
        'thebrianjung',
        'LagoTasso',
        'MacnBTC',
        'eliz883',
        '0xHustlepedia',
        'drakeondigital',
        'GarlamWON',
        'HouseOfCrypto3_',
        'kyle_chasse',
        'MarioNawfal',
        'gafoorkhann',
        'senamakel',
        'Sarv_shaktiman',
        'bebetoo_cuk',
        'gametheorizing',
        '0RYKER',
        'zeroblocks',
        'kimyg002',
        'ROKMCFIREANT',
        'lucianlampdefi',
        'BigcoinVN',
        'SimonTran1111',
        'tuannguyenminh',
        'tobi_k300',
        'vanthucbk',
        'LisaFlorentina8',
        'danhtran68',
        'bachkhoabnb',
        'kan0xgemi',
        'XDeGods',
        'auksorn_'
    ];


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

        twEventCenter.on('MSG_TWITTER_LABELS', async (data) => {
            console.log('Received message:', data);
            const xuserlables = await this.getlabels(data?.xusername);
            // Send back
            twEventCenter.emit('MSG_TWITTER_LABELS_RESP', xuserlables);
        });

        twEventCenter.on('MSG_KOLS_TWITTER_PROFILE', async () => {
            // console.log('Received message userkols:', JSON.stringify(data.kols));
            let searchResult = [];
            const limitedKols = await this.getRandomUsers(this.twitterKolUsers, 16);

            // Iterate through each KOL
            for (const kol of limitedKols) {
                const profiles = await this.searchProfileKols(kol, 1);
                if(profiles?.length > 0) {
                    // console.log('Received message kol: ' + kol +' profile:' + JSON.stringify(profiles[0]));
                    searchResult.push(profiles[0]);
                }
            }
            // Send back
            twEventCenter.emit('MSG_KOLS_TWITTER_PROFILE_RESP', searchResult);
        });
    }
    async getRandomUsers(users: string[], count: number): Promise<string[]> {
        const shuffled = [...users].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    async getlabels(xusername: string) {
        const result = [];
        try {
            if (!this.kolNameLabelDic || this.kolNameLabelDic.size === 0) {
                /**
                 * xuserlabels.json format:
                [{
                    "kolname": "cassshih",
                    "kollabel": "D1 Ventures Managing Director"
                },]
                **/
                const rawData = fs.readFileSync(
                    path.join("xuserlabels.json"),
                    "utf8"
                );
                const kolList = JSON.parse(rawData);
                kolList.forEach((kol) => {
                    this.kolNameLabelDic.set(kol.kolname, kol.kollabel);
                });
            }
            console.log("kolNameLabelDic size: " + this.kolNameLabelDic.size);
            let time = Date.now();
            if (!this.kolToFollowingSet || this.kolToFollowingSet.size === 0) {
                for await (const [key, value] of db_kol_following.iterator()) {
                    if (value) {
                        this.kolToFollowingSet.add(key);
                    }
                }
            }
            console.log(
                "traverse kolToFollowingSet took: " +
                    (Date.now() - time) +
                    " kolToFollowingSet size: " +
                    this.kolToFollowingSet.size
            );

            const following = xusername;
            let numKolStats = 0; // num of the KOLs that return.

            /**
             * 1. Iterate through all KOLs
             * 2. First, check if the relationship from KOL to following exists.
             * 3. If it exists, then query the label and the current KOL's profile.
             * 4. Add the label to the profile and return together
            */

            for (const [kol, label] of this.kolNameLabelDic) {
                const kolToFollowString = kol + "#" + following;
                // console.log('kolToFollowString: ', kolToFollowString);

                if (this.kolToFollowingSet.has(kolToFollowString)) {
                    const profileStr = await db_kol_profile_list.get(kol);
                    const profile = JSON.parse(profileStr);
                    console.log("kol: " + kol + " -> label: ", label);

                    profile.label = label || profile.name;
                    result.push(profile);
                    console.log("kol: " + kol + " -> profile: ",
                        profile
                    );

                    numKolStats++;
                    if(numKolStats >= 7){
                         break;
                    }
                }
            }
            return result;
        } catch (err) {
            console.error("getlabels: ", err.message);
        }
        return result;
    }
    async searchProfileKols(username: string, count: number) {
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
                            // console.log('Received message searchProfile kol: ' + JSON.stringify(profile));
                            searchResult.push(profile);
                            this.setCachedData(profile.username.toLowerCase(), profile);
                        }
                    }
                } catch (error) {
                    console.error("Search from client error:", error);
                }
            }
        } catch (error) {
            console.error("searchProfile error:", error);
        }
        return searchResult;
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
            // if (alreadyWatchedList) {
            //     for (const item of alreadyWatchedList) {
            //         const profile = {
            //             isWatched: true,
            //             username: item?.username,
            //             name: item?.name,
            //             avatar: item?.avatar,
            //         };

            //         if (item?.username) {
            //             usernameSet.add(item.username);
            //         }
            //         profilesOutput.push(profile);
            //     }
            // }

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
