import express from "express";
import { DirectClient } from "./index";
import { Scraper } from "agent-twitter-client";
import {
    Memory,
    settings,
    //elizaLogger,
    generateText,
    ModelClass,
    stringToUuid,
} from "@elizaos/core";
import { twEventCenter } from "@elizaos/client-twitter";
import { AgentConfig } from "../../../agent/src";
import {
    QUOTES_LIST,
    STYLE_LIST,
    TW_KOL_1,
    UserManager,
    InferMessageProvider,
    tokenWatcherConversationTemplate,
} from "@elizaos/plugin-data-enrich";
import { TwitterApi } from "twitter-api-v2";

import { Connection, clusterApiUrl } from "@solana/web3.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { InvalidPublicKeyError } from "../../plugin-data-enrich/src/solana";
import { InvalidPublicKeyError as SplInvalidPublicKeyError } from "../../plugin-data-enrich/src/solanaspl";
import { createSolTransferTransaction } from "../../plugin-data-enrich/src/solana";
import { createSolSplTransferTransaction } from "../../plugin-data-enrich/src/solanaspl";
import { callSolanaAgentTransfer } from "../../plugin-data-enrich/src/solanaagentkit";
import { transferEthToken } from "../../plugin-data-enrich/src/eth";
import { transferSui } from "../../plugin-data-enrich/src/sui";
import { transferStarknetToken } from "../../plugin-data-enrich/src/starknet";
import { MemoController } from "./memo";
import { requireAuth } from "./auth";
import { CoinAnalysisObj, KEY_BNB_CACHE_STR } from "../../client-twitter/src/sighter";
import { ArenaAnalysisObj, KEY_ARENA_CACHE_STR } from "../../client-twitter/src/arena";
//import { ethers } from 'ethers';
//import { requireAuth } from "./auth";

interface TwitterCredentials {
    username: string;
    password: string;
    email: string;
}

interface ApiResponse<T = any> {
    status?: number;
    success: boolean;
    message: string;
    data?: T;
}

interface CreateAgentRequest {
    name?: string;
    userId?: string;
    roomId?: string;
    userName: string;
    prompt: string;
    x: {
        username: string;
        email: string;
        password: string;
    };
}

class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

class AuthUtils {
    constructor(private client: DirectClient) {}

    private createResponse<T>(data?: T, message = "Success"): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
        };
    }

    private createErrorResponse(error: Error | ApiError): ApiResponse {
        const status = error instanceof ApiError ? error.status : 500;
        const message = error.message ?? "Internal server error";

        return {
            status,
            success: false,
            message,
        };
    }

    async withErrorHandling<T>(
        req: express.Request,
        res: express.Response,
        handler: () => Promise<T>
    ) {
        try {
            const result = await handler();
            return res.json(this.createResponse(result));
        } catch (error) {
            console.error(`Error in handler:`, error);
            const response = this.createErrorResponse(error);
            return res
                .status(error instanceof ApiError ? error.status : 500)
                .json(response);
        }
    }

    /*async verifyTwitterCredentials(
        credentials: TwitterCredentials
    ): Promise<any> {
        const scraper = new Scraper();
        try {
            await scraper.login(
                credentials.username,
                credentials.password,
                credentials.email
            );

            if (!(await scraper.isLoggedIn())) {
                throw new ApiError(401, "Twitter login failed");
            }

            const profile = await scraper.getProfile(credentials.username);
            return { ...profile };
        } finally {
            await scraper.logout();
        }
    }*/

    async getRuntime(agentId: string) {
        let runtime = this.client.agents.get(agentId);

        if (!runtime) {
            runtime = Array.from(this.client.agents.values()).find(
                (a) => a.character.name.toLowerCase() === agentId.toLowerCase()
            );
        }

        if (!runtime) {
            throw new ApiError(404, "Agent not found");
        }

        return runtime;
    }

    async validateRequest(agentId: string, userId: string) {
        if (!userId) {
            throw new ApiError(400, "Missing required field: userId");
        }

        const runtime = await this.getRuntime(agentId);
        const userManager = new UserManager(runtime.cacheManager);
        const userData = await userManager.verifyExistingUser(userId);

        return { runtime, profile: userData };
    }

    async ensureUserConnection(
        runtime: any,
        userId: string,
        roomId: string,
        username: string
    ) {
        await runtime.ensureConnection(
            userId,
            roomId,
            username,
            username,
            "direct"
        );
    }
}

export class Routes {
    private authUtils: AuthUtils;

    constructor(
        private client: DirectClient,
        //private registerCallbackFn?: (
        //    config: AgentConfig,
        //    memory: Memory
        //) => Promise<void>
    ) {
        this.authUtils = new AuthUtils(client);
    }

    setupRoutes(app: express.Application): void {
        app.post("/:agentId/login", this.handleLogin.bind(this));
        app.post("/:agentId/guest_login", this.handleGuestLogin.bind(this));
        app.get(
            "/:agentId/twitter_oauth_init",
            this.handleTwitterOauthInit.bind(this)
        );
        app.get(
            "/:agentId/twitter_oauth_callback",
            this.handleTwitterOauthCallback.bind(this)
        );
        app.get(
            "/:agentId/twitter_oauth_revoke",
            this.handleTwitterOauthRevoke.bind(this)
        );
        app.get(
            "/:agentId/bnb_query",
            this.handleBnbQuery.bind(this)
        );
        app.get(
            "/:agentId/arena_query",
            this.handleArenaQuery.bind(this)
        );
        app.post(
            "/:agentId/twitter_profile_search",
            this.handleTwitterProfileSearch.bind(this)
        );
        app.post(
            "/:agentId/twitter_profile_kols",
            this.handleTwitterProfileKols.bind(this)
        );
        app.post("/:agentId/re_twitter", this.handleReTwitter.bind(this));
        app.post(
            "/:agentId/translate_text",
            this.handleTranslateText.bind(this)
        );
        app.post("/:agentId/profile_upd", this.handleProfileUpdate.bind(this));
        app.post(
            "/:agentId/profile",
            //requireAuth,
            this.handleProfileQuery.bind(this)
        );
        app.post("/:agentId/create_agent", this.handleCreateAgent.bind(this));
        app.get("/:agentId/config", this.handleConfigQuery.bind(this));
        app.post("/:agentId/watch", this.handleWatchText.bind(this));
        app.post("/:agentId/chat", this.handleChat.bind(this));
        const memoController = new MemoController(this.client);
        app.get(
            "/:agentId/memo",
            requireAuth,
            memoController.handleGetMemoList.bind(memoController)
        );
        app.post(
            "/:agentId/memo",
            requireAuth,
            memoController.handleAddMemo.bind(memoController)
        );
        app.delete(
            "/:agentId/memo",
            requireAuth,
            memoController.handleDeleteMomo.bind(memoController)
        );
        app.post("/:agentId/gain_rewards", this.handleGainRewards.bind(this));

        //app.post("/:agentId/transfer_sol", this.handleSolTransfer.bind(this));
        //app.post("/:agentId/solkit_transfer",
        //    this.handleSolAgentKitTransfer.bind(this));
    }

    async handleLogin(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const {
                userId,
                gmail,
                roomId: customRoomId,
                // userId: customUserId,
            } = req.body;

            if (!userId) {
                throw new ApiError(400, "Missing required fields");
            }

            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const roomId = stringToUuid(
                customRoomId ?? `default-room-${userId}-${req.params.agentId}`
            );

            await this.authUtils.ensureUserConnection(
                runtime,
                userId,
                roomId,
                "User"
            );

            const userManager = new UserManager(runtime.cacheManager);

            const cacheProfile = await userManager.verifyExistingUser(userId);
            if(cacheProfile) {
                return {
                    profile: cacheProfile,
                };
            }

            const userProfile = userManager.createDefaultProfile(userId, gmail);
            await userManager.saveUserData(userProfile);

            return {
                profile: userProfile,
            };
        });
    }

    async handleGuestLogin(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            var userId = null;
            const {
                username,
                email,
                password,
                roomId: customRoomId,
                // userId: customUserId,
            } = req.body;

            if (username && username.toString().startsWith("Guest-")) {
                userId = stringToUuid(username);
            }

            if (!userId) {
                throw new ApiError(400, "Missing required fields");
            }

            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const roomId = stringToUuid(
                customRoomId ?? `default-room-${userId}-${req.params.agentId}`
            );

            await this.authUtils.ensureUserConnection(
                runtime,
                userId,
                roomId,
                "User"
            );

            const userManager = new UserManager(runtime.cacheManager);
            const cacheProfile = await userManager.verifyExistingUser(userId);
            if(cacheProfile) {
                return {
                    profile: cacheProfile,
                };
            }
            const userProfile = userManager.createDefaultProfile(userId, email);
            await userManager.saveUserData(userProfile);

            return {
                profile: userProfile,
            };
        });
    }

    async handleTwitterOauthInit(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const { userId } = req.query;
            const client = new TwitterApi({
                clientId: settings.TWITTER_CLIENT_ID,
                clientSecret: settings.TWITTER_CLIENT_SECRET,
            });

            const { url, state, codeVerifier } = client.generateOAuth2AuthLink(
                `${settings.MY_APP_URL}/${req.params.agentId}/twitter_oauth_callback?userId=${userId}`,
                {
                    scope: [
                        "tweet.read",
                        "tweet.write",
                        "users.read",
                        "offline.access",
                    ],
                }
            );

            // Save state & codeVerifier
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const userManager = new UserManager(runtime.cacheManager);
            const userProfile = await userManager.verifyExistingUser(userId);
            userProfile.tweetProfile.codeVerifier = codeVerifier;
            await userManager.saveUserData(userProfile);
            await runtime.cacheManager.set(
                state,
                JSON.stringify({
                    codeVerifier,
                    timestamp: Date.now(),
                }),
                {
                    expires: Date.now() + 2 * 60 * 60 * 1000,
                }
            );
            //await runtime.databaseAdapter?.setCache({
            //    agentId: state,
            //    key: 'oauth_verifier',
            //    value: JSON.stringify({
            //        codeVerifier,
            //        state,
            //        timestamp: Date.now()
            //    }),
            //    ttl: 3600 // 1hour
            //});

            return { url, state };
        });
    }

    async handleTwitterOauthCallback(
        req: express.Request,
        res: express.Response
    ) {
        //return this.authUtils.withErrorHandling(req, res, async () => {
        // 1. Get code and state
        const { code, state, userId } = req.query;

        if (!code || !state || !userId) {
            res.status(200).json({ ok: true });
            return;
            //throw new ApiError(400, "Missing required OAuth parameters");
        }

        const runtime = await this.authUtils.getRuntime(req.params.agentId);

        const verifierData = await runtime.cacheManager.get(state);
        if (!verifierData) {
            // error
            console.error(
                `OAuth verification failed - State: ${state}, No verifier data found`
            );
            throw new ApiError(
                400,
                "OAuth session expired or invalid. Please try authenticating again."
            );
        }

        const { codeVerifier, timestamp } = JSON.parse(verifierData);

        try {
            const clientLog = new TwitterApi({
                clientId: settings.TWITTER_CLIENT_ID,
                clientSecret: settings.TWITTER_CLIENT_SECRET,
            });

            const {
                client: loggedClient,
                accessToken,
                refreshToken,
                expiresIn,
            } = await clientLog.loginWithOAuth2({
                code,
                codeVerifier,
                redirectUri: `${settings.MY_APP_URL}/${req.params.agentId}/twitter_oauth_callback?userId=${userId}`,
            });

            let username = "";
            if (loggedClient) {
                const me = await loggedClient.v2.me();
                if (me?.data) {
                    username = me.data.username;
                    //name = me.data.name;
                }
            }

            // Clear
            await runtime.databaseAdapter?.deleteCache({
                agentId: req.params.agentId,
                key: state,
            });

            // Save twitter profile
            // TODO: encrypt token
            //const userId = stringToUuid(username);
            const userManager = new UserManager(runtime.cacheManager);
            const userProfile = await userManager.getUserProfile(userId);
            userProfile.tweetProfile = {
                username,
                email: "",
                avatar: "",
                code,
                codeVerifier,
                accessToken,
                refreshToken,
                expiresIn,
            };
            await this.handleGrowthExperience(20, userProfile, "twitter auth");
            await userManager.saveUserData(userProfile);

            //return { accessToken };
            res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Auth</title>
                    </head>
                    <body>
                        <div style="text-align: center; font-size: 20px; font-weight: bold;">
                            <br>Auth Success! Redirecting...<br>
                            <script type="text/javascript">
                                function closeWindow() {
                                    console.log('closeWindow');
                                    try {
                                        window.opener.postMessage({
                                            type: 'TWITTER_AUTH_SUCCESS',
                                            code: '${code}',
                                            username: '${username}',
                                            accessToken: '${accessToken}',
                                            refreshToken: '${refreshToken}',
                                            expiresIn: '${expiresIn}',
                                            state: '${state}'
                                        },
                                        '*'
                                        );
                                        window.close();
                                    } catch(e) {
                                        console.log(e);
                                    }
                                }
                                closeWindow();
                            </script>
                            <button style="text-align: center; width: 40%; height: 40px; font-size: 20px; background-color: #9F91ED; color: #ffffff; margin: 20px; border: none; border-radius: 10px;"
                                onclick="closeWindow()">
                                Click to Close</button>
                            <br>
                        </div>
                    </body>
                </html>`);
        } catch (error) {
            console.error("Error during OAuth callback:", error);
            //throw new ApiError(500, "Internal server error");
            res.status(500).json({ error: "Internal server error" });
        }
        //});
    }

    async handleTwitterOauthRevoke(
        req: express.Request,
        res: express.Response
    ) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const { userId } = req.query;
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const userManager = new UserManager(runtime.cacheManager);
            const userProfile = await userManager.getUserProfile(userId);
            try {
                const accessToken = userProfile.tweetProfile?.accessToken;
                const urlRevoke = "https://api.twitter.com/oauth2/revoke";
                const response = await fetch(urlRevoke, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // 使用访问令牌进行认证
                    },
                });

                if (!response.ok) {
                    console.error("Failed to revoke access token");
                }

                // Save userProfile
                userProfile.tweetProfile.username = "";
                userProfile.tweetProfile.code = "";
                userProfile.tweetProfile.codeVerifier = "";
                userProfile.tweetProfile.accessToken = "";
                userProfile.tweetProfile.refreshToken = "";
                await userManager.saveUserData(userProfile);

                //const data = await response.json();
                //console.log("Authorization revoked successfully:", data);
            } catch (err) {
                console.error("Twitter auth revoke error:", err);
            }

            return { userProfile };
        });
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async handleBnbQuery(req: express.Request, res: express.Response) {
        const symbol = typeof req.query.coinsymbol === 'string' ? req.query.coinsymbol : '';
        const coinsymbol = symbol.trim();
        if (!coinsymbol) {
            throw new ApiError(533, "coinsymbol is blank");
        }
        console.log("handleBnbQuery symbol: " + coinsymbol);
        const runtime = await this.authUtils.getRuntime(req.params.agentId);
        let userId = "blank";
        twEventCenter.emit("MSG_BNB_QUERY", coinsymbol, userId);
        let coinAnaObj: CoinAnalysisObj = null;

        for (let i = 0; i < 10; i++) {
            await this.sleep(1000);
            const cached = await runtime.cacheManager.get(KEY_BNB_CACHE_STR + coinsymbol);
            // console.log("handleBnbQuery, cached: " + cached);
            if (cached && typeof cached === 'string') {
                try {
                    coinAnaObj = JSON.parse(cached);
                    if (coinAnaObj) {
                        if (Date.now() - coinAnaObj.timestamp > 3000) {
                            continue;
                        } else {
                            break;
                        }
                    }
                } catch (error) {
                    console.error('JSON parse failed: ', error);
                }
            }
        }

        if (coinAnaObj && coinAnaObj.coin_analysis && coinAnaObj.coin_prediction) {
            res.json({
                coin_analysis: coinAnaObj.coin_analysis,
                coin_prediction: coinAnaObj.coin_prediction,
            });
        }
        else {
            res.json({
                res: false,
                reason: "try again",
            });
        }
    }

    async handleArenaQuery(req: express.Request, res: express.Response) {
        const kol = typeof req.query.username === 'string' ? req.query.username : '';
        const kolname = kol.trim();
        if (!kolname) {
            throw new ApiError(533, "kolname is blank");
        }
        console.log("handleArenaQuery, kolname: " + kolname);
        const runtime = await this.authUtils.getRuntime(req.params.agentId);
        let userId = "blank";
        twEventCenter.emit("MSG_ARENA_QUERY", kolname, userId);
        let anaObj: ArenaAnalysisObj = null;

        for (let i = 0; i < 10; i++) {
            await this.sleep(1000);
            const cached = await runtime.cacheManager.get(KEY_ARENA_CACHE_STR + kolname);
            // console.log("handleArenaQuery, cached: " + cached);
            if (cached && typeof cached === 'string') {
                try {
                    anaObj = JSON.parse(cached);
                    if (anaObj) {
                        if (Date.now() - anaObj.timestamp > 3000) {
                            continue;
                        } else {
                            break;
                        }
                    }
                } catch (error) {
                    console.error('JSON parse failed: ', error);
                }
            }
        }

        if (anaObj && anaObj.coin_analysis && anaObj.coin_prediction) {
            res.json({
                coin_analysis: anaObj.coin_analysis,
                coin_prediction: anaObj.coin_prediction,
            });
        }
        else {
            res.json({
                res: false,
                reason: "try again",
            });
        }
    }

    async handleTwitterProfileSearch(
        req: express.Request,
        res: express.Response
    ) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const { username, count, userId } = req.body;
            const fetchCount = Math.min(20, count);
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            console.log(userId);

            try {
                let profilesOutput = [];
                /*const scraper = new Scraper();
                try {
                    await scraper.login(
                        settings.TWITTER_USERNAME,
                        settings.TWITTER_PASSWORD,
                        settings.TWITTER_EMAIL
                    );

                    if (!(await scraper.isLoggedIn())) {
                        throw new ApiError(401, "Twitter process failed");
                    }

                    const profilesForScraper = await scraper.searchProfiles(
                        username,
                        fetchCount
                    );
                    const userManager = new UserManager(runtime.cacheManager);
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
                    for await (const profile of profilesForScraper) {
                        profile.isWatched = await userManager.isWatched(
                            userId,
                            profile.username
                        );
                        if (!profile.isWatched) {
                            profilesOutput.push(profile);
                        }
                    }
                } finally {
                    await scraper.logout();
                }*/
                const promise = new Promise((resolve, reject) => {
                    // Listen
                    twEventCenter.on('MSG_SEARCH_TWITTER_PROFILE_RESP', (data) => {
                        //console.log('Received Resp message:', data);

                        // get result
                        resolve(data);
                    });

                    // set request
                    twEventCenter.emit('MSG_SEARCH_TWITTER_PROFILE',
                        { username, count: fetchCount, userId });
                    //console.log("Send search request");
                });

                // wait for result
                profilesOutput = await promise;
                return profilesOutput;
            } catch (error) {
                console.error("Profile search error:", error);
                //return res.status(500).json({
                //    success: false,
                //    error: "User search error",
                //});
                return [];
            }
        });
    }

    async handleTwitterProfileKols(
        req: express.Request,
        res: express.Response
    ) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            // const { username, count, userId } = req.body;
            const {userId } = req.body;
            //const fetchCount = Math.min(20, count);
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            console.log("kols handleTwitterProfileKols" + userId);
            if (!userId) {
                console.error("userId is empty.");
                return [];
            }

            try {
                let profilesOutput = [];
                const promise = new Promise((resolve, reject) => {
                    twEventCenter.on('MSG_KOLS_TWITTER_PROFILE_RESP', (data) => {
                        resolve(data);
                    });

                    // set request
                    twEventCenter.emit('MSG_KOLS_TWITTER_PROFILE', { });
                    //console.log("Send search request");
                });

                // wait for result
                profilesOutput = await promise;
                return profilesOutput;
            } catch (error) {
                console.error("Profile search error:", error);
                return [];
            }
        });
    }

    async handleReTwitter(req: express.Request, res: express.Response) {
        try {
            console.log("handleReTwitter");

            const { text, userId } = req.body;
            twEventCenter.emit("MSG_RE_TWITTER", text, userId);
            return res.json({
                success: true,
                data: "re_twitter",
            });
        } catch (error) {
            console.error("handleReTwitter error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }

    async handleTranslateText(req: express.Request, res: express.Response) {
        try {
            const {languagecode, text } = req.body;
            console.log("handleTranslateText, code: " + languagecode);
            console.log("handleTranslateText, text: " + text);
            if(!languagecode || languagecode === "en" || languagecode.includes("en-")) {
                return res.json({
                    success: true,
                    data:  {"result": text},
                });
            }


            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const prompt =
                'You are a helpful translator. Please translate the following text into the language corresponding to this code: ' + languagecode + ', The returned result only includes the translated result,The JSON structure of the returned result is: {"result":""}, No need to use markdown syntax to modify JSON, just include JSON. The text that needs to be translated starts with [Text]. [TEXT]: ' +
                text;
            //console.log("handleTranslateText " + prompt);

            const response = await generateText({
                runtime: runtime,
                context: prompt,
                modelClass: ModelClass.SMALL,
            });
            //console.log("handleTranslateText " + response);

            if (!response) {
                throw new Error("No response from generateText");
            }
            // response struct: {"result":""}
            const responseObj = JSON.parse(response);
            return res.json({
                success: true,
                data: responseObj,
            });
        } catch (error) {
            console.error("handleTranslateText error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }

    async handleProfileUpdate(req: express.Request, res: express.Response) {
        try {
            const { profile } = req.body;

            // Required field
            if (!profile || !profile.userId) {
                return res.status(400).json({
                    success: false,
                    error: "Missing required profile fields",
                });
            }

            // Array
            /*if (
                !Array.isArray(profile.bio) ||
                !Array.isArray(profile.topics) ||
                !Array.isArray(profile.messageExamples)
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid array fields in profile",
                });
            }

            // Objects
            if (
                !profile.style.all ||
                !profile.style.chat ||
                !profile.style.post ||
                !Array.isArray(profile.style.all) ||
                !Array.isArray(profile.style.chat) ||
                !Array.isArray(profile.style.post)
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid style configuration",
                });
            }*/

            // update profile
            const { runtime, profile: existingProfile } =
                await this.authUtils.validateRequest(
                    req.params.agentId,
                    profile.userId
                );

            if (profile?.bio && !existingProfile?.bio) {
                this.handleGrowthExperience(
                    20,
                    profile,
                    "agent name,gender,style config."
                );
            }
            // console.log("growth experience: begin. ");
            // console.log(
            //     "growth experience: old: ",
            //     existingProfile?.agentCfg?.enabled
            // );
            // console.log("growth experience: new: ", profile?.agentCfg?.enabled);

            if (
                profile?.agentCfg?.enabled &&
                !existingProfile?.agentCfg?.enabled
            ) {
                this.handleGrowthExperience(20, profile, "enable agent.");
            }
            if (
                (profile?.twitterWatchList?.length ?? 0) >
                (existingProfile?.twitterWatchList?.length ?? 0)
            ) {
                this.handleGrowthExperience(
                    10,
                    profile,
                    "watch a new twitter."
                );
            }

            const updatedProfile = { ...existingProfile, ...profile };
            const userManager = new UserManager(runtime.cacheManager);
            await userManager.updateProfile(updatedProfile);

            return res.json({
                success: true,
                profile: updatedProfile,
            });
        } catch (error) {
            console.error("Profile update error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }

    async handleProfileQuery(req: express.Request, res: express.Response) {
        try {
            const { profile } = await this.authUtils.validateRequest(
                req.params.agentId,
                req.body.userId
            );

            return res.json({
                success: true,
                profile,
            });
        } catch (error) {
            console.error("Profile query error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }

    async handleCreateAgent(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const { userId } = req.body;

            if (!userId) {
                throw new ApiError(400, "Missing required field: userId");
            }
            try {
                // Get user profile and credentials
                const { runtime, profile } = await this.authUtils.validateRequest(
                    req.params.agentId,
                    userId
                );

                const {
                    name = profile.agentname,
                    roomId: customRoomId,
                    prompt,
                } = req.body;

                // if (!prompt) {
                //     throw new ApiError(400, "Missing required field: prompt");
                // }

                const roomId = stringToUuid(
                    customRoomId ??
                        `default-room-${profile.userId}-${req.params.agentId}`
                );
                const newAgentId = stringToUuid(userId);

                // Create agent config from user credentials
                const agentConfig: AgentConfig = {
                    ...profile,
                    prompt,
                    clients: ["twitter"],
                    modelProvider: "redpill",
                    bio: Array.isArray(profile.bio)
                        ? profile.bio
                        : [profile.bio || `I am ${name}`],
                    style: profile.style || {
                        all: [],
                        chat: [],
                        post: [],
                    },
                    adjectives: profile.adjectives || [],
                    lore: profile.lore || [],
                    knowledge: profile.knowledge || [],
                    topics: profile.topics || [],
                };

                // Ensure connection
                await runtime.ensureConnection(
                    userId,
                    roomId,
                    profile.userId,
                    name,
                    "direct"
                );

                // Create memory
                const messageId = stringToUuid(Date.now().toString());
                const memory: Memory = {
                    id: messageId,
                    agentId: runtime.agentId,
                    userId,
                    roomId,
                    content: {
                        text: prompt,
                        attachments: [],
                        source: "direct",
                        inReplyTo: undefined,
                    },
                    createdAt: Date.now(),
                };

                await runtime.messageManager.createMemory(memory);

                // Register callback if provided
                //if (this.client.registerCallbackFn) {
                //    await this.client.registerCallbackFn(agentConfig, memory);
                //}

                return { profile, agentId: newAgentId };
            } catch (error) {
                console.error("Create Agent error:", error);
                return res.status(500).json({
                    success: false,
                    error: "Internal server error",
                });
            }
        });
    }

    async handleConfigQuery(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const quoteIndex = Math.floor(
                Math.random() * (QUOTES_LIST.length - 1)
            );
            return {
                styles: STYLE_LIST,
                kols: settings.TW_KOL_LIST || TW_KOL_1,
                quote: QUOTES_LIST[quoteIndex],
            };
        });
    }

    async handleWatchText(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const userManager = new UserManager(runtime.cacheManager);
            const profile = await userManager.verifyExistingUser(
                req.body.userId
            );
            this.handleGrowthExperience(
                10,
                profile,
                "watch the text message list"
            );
            userManager.saveUserData(profile);

            try {
                //const { cursor, watchlist } = req.body;
                const { userId } = req.body;
                const cursor = "";
                const watchItemList = await userManager.getWatchList(userId);
                const watchlist: string[] = watchItemList.map(user => user.username);
                let report;
                if (watchlist && watchlist.length > 0) {
                    report =
                        await InferMessageProvider.getWatchItemsPaginatedForKols(
                            runtime.cacheManager,
                            watchlist,
                            cursor
                        );
                    if (!report || report.items?.length === 0) {
                        report =
                            await InferMessageProvider.getAllWatchItemsPaginated(
                                runtime.cacheManager,
                                cursor
                            );
                    }
                    else if (report && report.items?.length < 10) {
                        let newReport =
                            await InferMessageProvider.getAllWatchItemsPaginated(
                                runtime.cacheManager,
                                cursor
                            );
                        report.push(...newReport);
                    }
                } else {
                    report =
                        await InferMessageProvider.getAllWatchItemsPaginated(
                            runtime.cacheManager,
                            cursor
                        );
                }
                return { watchlist: report, profile };
            } catch (error) {
                console.error("Error fetching token data:", error);
                return { report: "Watcher is in working, please wait." };
            }
        });
    }

    async handleChat(req: express.Request, res: express.Response) {
        return this.authUtils.withErrorHandling(req, res, async () => {
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const prompt =
                `Your name is ${req.body.name || runtime.character.name},
                Here are user input content:
            ${req.body.text}` + tokenWatcherConversationTemplate;

            try {
                let response = await generateText({
                    runtime: runtime,
                    context: prompt,
                    modelClass: ModelClass.SMALL,
                });

                if (!response) {
                    throw new Error("No response from generateText");
                }
                response = response.replaceAll("```", "");
                response = response.replace("json", "");

                const userManager = new UserManager(runtime.cacheManager);
                const profile = await userManager.verifyExistingUser(
                    req.body.userId
                );
                this.handleGrowthExperience(5, profile, "chat with agent");
                userManager.saveUserData(profile);
                return { response, profile };
            } catch (error) {
                console.error("Error response token question:", error);
                return { response: "Response with error" };
            }
        });
    }

    async handleGainRewards(req: express.Request, res: express.Response) {
        try {
            console.log("handleGainRewards 0");
            const { typestr, userId } = req.body;
            const runtime = await this.authUtils.getRuntime(req.params.agentId);
            const userManager = new UserManager(runtime.cacheManager);
            const profile = await userManager.verifyExistingUser(userId);
            //const address = profile.walletAddress;// "0xdD1Be812e7ACe045C67167503157a9FC88D6E403"; //profile.walletAddress;
            let address = "";
            if (profile && profile.wallets) {
                address = profile.wallets[typestr];
            }
            if (!address) {
                address = profile.walletAddress;
            }
            if (!address) {
                throw new ApiError(400, "Missing required field: walletAddress");
            }
            const tokenAmount = 1; // tokenAmount Backend control
            switch (typestr) {
                case "sol-spl":
                    // Handle sol-spl transfer
                    try {
                        const signature = await createSolSplTransferTransaction({
                            //fromTokenAccountPubkey: settings.SOL_SPL_FROM_PUBKEY,
                            toTokenAccountPubkey: address,
                            //ownerPubkey: settings.SOL_SPL_OWNER_PUBKEY,
                            tokenAmount,
                        });
                        return res.json({
                            success: true,
                            signature,
                            data: "Sol-SPL reward processed",
                        });
                        
                        // Confirm the transction
                        /*const connection = new Connection(
                            clusterApiUrl("mainnet-beta"),
                            "confirmed"
                        );
                        const signature = await sendAndConfirmTransaction(
                            connection,
                            transaction,
                            [settings.SOL_SPL_OWNER_PUBKEY]
                        );
                        return { signature };*/
                    } catch (error) {
                        if (error instanceof SplInvalidPublicKeyError) {
                            throw new ApiError(400, error.message);
                        }
                        console.error(
                            "Error creating spl transfer transaction:",
                            error
                        );
                        throw new ApiError(500, "Internal server error");
                    }
                    break;
                case "sol":
                    // Handle sol transfer
                    try {
                        const transaction = await createSolTransferTransaction({
                            fromPubkey: settings.SOL_FROM_PUBKEY,
                            toPubkey: address,
                            solAmount: tokenAmount,
                        });

                        // Confirm the transction
                        const connection = new Connection(
                            clusterApiUrl("mainnet-beta"),
                            "confirmed"
                        );
                        const signature = await sendAndConfirmTransaction(
                            connection,
                            transaction,
                            [settings.SOL_OWNER_PUBKEY]
                        );
                        return { signature };
                    } catch (error) {
                        if (error instanceof InvalidPublicKeyError) {
                            throw new ApiError(400, error.message);
                        }
                        console.error(
                            "Error creating sol transfer transaction:",
                            error
                        );
                        throw new ApiError(500, "Internal server error");
                    }
                case "sol-agent-kit":
                    // Handle sol-spl agent-kit transfer
                    try {
                        //return res.json({
                        //    success: true,
                        //    data: "Sol-agent-kit reward processed",
                        //});
                        const transaction = await callSolanaAgentTransfer({
                            toTokenAccountPubkey: address,
                            mintPubkey: settings.SOL_SPL_OWNER_PUBKEY,
                            tokenAmount,
                        });
                        return { transaction };
                    } catch (error) {
                        if (error instanceof SplInvalidPublicKeyError) {
                            throw new ApiError(400, error.message);
                        }
                        console.error(
                            "Error creating sol-agent-kit transaction:",
                            error
                        );
                        throw new ApiError(500, "Internal server error");
                    }
                case "eth":
                case "bsc":
                case "base":
                case "mantle":
                    // Handle eth and eth-compatible transfer
                    const signature = await transferEthToken(address, '1000', typestr);
                    return res.json({
                        success: true,
                        signature,
                        data: "ETH eco reward processed",
                    });
                case "sui":
                    // Handle SUI transfer
                    const suiHash = await transferSui(address, '1000');
                    return res.json({
                        success: true,
                        signature: suiHash,
                        data: "SUI reward processed",
                    });
                case "starknet":
                    // Handle Starknet transfer
                    const snHash = await transferStarknetToken(address, '1000');
                    return res.json({
                        success: true,
                        signature: snHash,
                        data: "Starknet reward processed",
                    });
                case "base-test":
                    // Handle base transfer
                    console.log("handleGainRewards 1");
                    // Connect to Ethereum node
                    /** const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.dev');
                    // Set wallet's private key //
                    const privateKey = 'e9705f404a61aafbdb094e80a3e446e36be1ebdd9f43b35b676a0b808320dcf8'; // Ensure this is stored securely
                    const wallet = new ethers.Wallet(privateKey, provider);
                    // Set transaction parameters
                    const toAddress = address; // Use the provided wallet address
                    const amountInEther = ethers.utils.formatEther(tokenAmount); // Convert tokenAmount to Ether
                    console.log("handleGainRewards 5");

                    async function sendTransaction() {
                        const tx = {
                            to: toAddress,
                            value: ethers.utils.parseEther(amountInEther), // Convert ETH amount to wei
                            gasLimit: 21000, // Default gas limit
                            gasPrice: await provider.getGasPrice(), // Get current gas price
                        };
                        console.log("handleGainRewards 6");

                        try {
                            const transactionResponse = await wallet.sendTransaction(tx);
                            console.log(`handleGainRewards 61 sent: ${transactionResponse.hash}`);

                            // Wait for the transaction to be mined
                            const receipt = await transactionResponse.wait();
                            console.log(`handleGainRewards 62 confirmed in block: ${receipt.blockNumber}`);
                        } catch (error) {
                            console.error('handleGainRewards 63 Transaction failed', error);
                            throw new ApiError(500, "Transaction failed");
                        }
                    }
                    await sendTransaction();
*/
                    return res.json({
                        success: true,
                        data: "base reward processed",
                    });
                // Add more cases as needed
                default:
                    return res.status(400).json({
                        success: false,
                        error: "Invalid reward type",
                    });
            }
        } catch (error) {
            console.error("handleGainRewards error:", error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    }

    async handleGrowthExperience(exp: number, profile: any, reason: string) {
        if (!profile) {
            return;
        }
        console.log(
            "growth experience: before, ",
            profile.userId,
            profile.experience,
            exp,
            reason
        );
        let curlevel = profile.level;
        let curexperience = profile.experience + exp;
        if (curexperience >= 100) {
            curexperience %= 100;
            curlevel++;
        }
        profile.level = curlevel;
        profile.experience = curexperience;
        console.log(
            "growth experience: after, ",
            profile.userId,
            profile.experience,
            exp,
            reason
        );
    }
}
