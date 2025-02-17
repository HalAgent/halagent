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

const TW_PROFILE_PREFIX: string = "FINDER_KEY_TW_PROFILE_PREFIX_";
interface KolItem {
    kolname: string;
    kollabel: string;
    kollabel_en: string;
};

export class TwitterFinderClient {
    client: ClientBase;
    runtime: IAgentRuntime;
    kolList: KolItem[];
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
        'HouseOfCrypto3',
        'kyle_chasse',
        'MarioNawfal',
        'gafoorkhann',
        'senamakel',
        'Sarv_shaktiman',
        'bebetoo_cuk',
        'gametheorizing',
        '0RYKER',
        'hebi555',
        'zyclw',
        'Phyrex_Ni',
        'hellosuoha',
        'Web3Nina',
        '0xjuu_17',
        'visionofviii',
        'MetaHunter168',
        'vikingdao2022',
        'xiaoxin_bit',
        '0xSunNFT',
        '0xKillTheWolf',
        'Mumu_yay',
        'laoxue_eth',
        'jianshubiji',
        'cryp_orange',
        'zeroblocks',
        'luge517',
        'SEFATUBA3',
        'hhyjylabs',
        '0xKevin00',
        'tyw1984',
        '0xzhaozhao',
        'pipizhu_eth',
        'Elizabethofyou',
        'connectfarm1',
        '0xcryptowizard',
        'CoinHuSays',
        '0xmina_',
        'cherlyn0105',
        'Unipioneer',
        'kimyg002',
        'ROKMCFIREANT',
        'akiii345',
        'lucianlampdefi',
        'BigcoinVN',
        'SimonTran1111',
        'tuannguyenminh',
        'tobi_k300',
        'vanthucbk',
        'LisaFlorentina8',
        'danhtran68',
        'bachkhoabnb',
        'Kan_0xGemi',
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
            // console.log('Received message:', data);
            const xuserlables = await this.getlabels(data?.xuserlist);
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
    
    async getlabels(xnamelist: string[]) {
        try {
            if (!this.kolList) {
                const rawData =  fs.readFileSync(path.join('xuserlabels.json'), 'utf8');
                this.kolList = JSON.parse(rawData);
            }

            // this.kolList.forEach((kol, index) => {
            //     console.log(`KOL ${index + 1}:`);
            //     console.log(`Name: ${kol.kolname}`);
            //     console.log(`Label (CN): ${kol.kollabel}`);
            //     console.log(`Label (EN): ${kol.kollabel_en}\n`);
            // });

            const kolDict = this.kolList.reduce((acc, kol) => {
                acc[kol.kolname] = kol;
                return acc;
            }, {});

            const result = {};

            for (const name of xnamelist) {
                if (Object.prototype.hasOwnProperty.call(kolDict, name)) {
                    result[name] = kolDict[name];
                } else {
                    result[name] = {"kolname": name, "kollabel": name, "kollabel_en": name};
                }
            }
            return result;
        } catch (err) {
            console.error('getlabels:', err.message);
        }
        return null;
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
