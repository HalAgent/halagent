import { UserManager, ConsensusProvider } from "@elizaos/plugin-data-enrich";
import {
    avalanchePlugin
} from "@elizaos/plugin-avalanche";
import {
    elizaLogger,
    generateText,
    IAgentRuntime,
    ModelClass,
} from "@elizaos/core";
import { ClientBase } from "./base";
import { SearchMode } from "agent-twitter-client";
import { UserResponce } from "../../plugin-avalanche/src/types/index";

export const KEY_ARENA_CACHE_STR = "key_arena_res_cache_";

export class ArenaAnalysisObj {
    public coin_analysis: string;
    public coin_prediction: string;
    public timestamp: number;
    public token: string;
    constructor(token: string, analysis: string, prediction: string) {
        this.token = token;
        this.coin_analysis = analysis;
        this.coin_prediction = prediction;
        this.timestamp = Date.now();
    }
}

export class ArenaClient {
    client: ClientBase;
    runtime: IAgentRuntime;
    userManager: UserManager;

    constructor(client: ClientBase, runtime: IAgentRuntime) {
        this.client = client;
        this.runtime = runtime;
        this.userManager = new UserManager(this.runtime.cacheManager);
        this.sendingTwitterDebug = false;
    }

    intervalId: NodeJS.Timeout;
    sendingTwitterDebug: boolean;

    async start() {
        console.log("Arena Query start");
        if (!this.client.profile) {
            await this.client.init();
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async extractBraceContent(input: string): Promise<string> {
        const regex = /\{.*\}/;
        const match = input.match(regex);
        return match ? match[0] : '';
    }

    async arenaQuery(username: string, userId: any) {
        // 1. get param. 2 get prompt. 3. get tweet info. 4. get arena info. 5. get ai answer.

        console.log("arenaQuery, in arana. username: " + username);
        const promptHeader = "You are a cryptocurrency expert with extensive experience in cryptocurrency trading and frequently active in various cryptocurrency communities. You are now providing an analysis based on the following two social media platforms. The first one is some dynamics of X account, and the second one is the first web3 social media associated with X. I will first provide the updates of X account";
        const promptFooter =  " please use 100 - word English texts respectively to analyze the reasons for the current price trend. The response format should be formatted as a JSON block as follows: {\"coin_analysis\": \"{coin_analysis}\"}. No other text should be provided, No need to use markdown syntax, just return JSON directly.";

        const tweetsres = await this.client.fetchSearchTweets(
            username,
            20, SearchMode.Latest
        );
        const promptTweet =
            `
Here are some tweets/replied:
${[...tweetsres?.tweets]
                .filter((tweet) => {
                    // ignore tweets where any of the thread tweets contain a tweet by the bot
                    const thread = tweet.thread;
                    const botTweet = thread.find(
                        (t) =>
                            t.username ===
                            this.runtime.getSetting("TWITTER_USERNAME")
                    );
                    return !botTweet;
                })
                .map(
                    (tweet) => `
From: ${tweet.name} (@${tweet.username})
Text: ${tweet.text}\n
Likes: ${tweet.likes}, Replies: ${tweet.replies}, Retweets: ${tweet.retweets},
    `
                )
                .join("\n")}
`;


        let promptArena = `There is another web3 social networking site based on X website below, with the same account. It can send content and also capture X's dynamics on the same account. The user associated with this account has corresponding cryptocurrency prices and user information, as shown below`;
        const { actions } = avalanchePlugin;
        let aranaQueryAction = null;
        actions.forEach(action => {
            // console.log( "arenaQuery, action.name: " + action.name );
            if(action.name === 'PROFILE_CHECK') {
                aranaQueryAction = action;
            }
        });

        const arenaOptions: Record<string, unknown> = {
            kolname: username,
        };
        const data  = await aranaQueryAction.handler(this.runtime, null, null, arenaOptions, null);

        if(data) {
            promptArena += JSON.stringify(data)
        }
        console.log("arenaQuery, in arenaQuery.  promt:\npromptHeader"
             + promptHeader + "\n promptTweet  "
             + promptTweet + "\n promptArena: " + promptArena + "\n promptFooter " + promptFooter);

        let responseStr = await generateText({
            runtime: this.runtime,
            context: promptHeader + promptTweet + promptArena + promptFooter,
            modelClass: ModelClass.LARGE,
        });
        console.log("arenaQuery, in arenaQuery. responseStr: ", responseStr);

        let responseObj = null;
        try {
            responseObj = JSON.parse(responseStr);
        } catch (error) {
            responseObj = null;
            console.error('JSON parse error: ', error.message);
        }
        if (responseObj) {
            const anaobj = new ArenaAnalysisObj(username, responseObj?.coin_analysis, "empty");
            await this.runtime.cacheManager.set(KEY_ARENA_CACHE_STR + username, JSON.stringify(anaobj));
        }
    }
}
