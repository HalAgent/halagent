import {
    TW_KOL_1,
    TW_KOL_2,
    TW_KOL_3,
} from "@elizaos/plugin-data-enrich";
import {
    ConsensusProvider,
    InferMessageProvider,
} from "@elizaos/plugin-data-enrich";
import {
    elizaLogger,
    generateText,
    IAgentRuntime,
    ModelClass,
    settings,
} from "@elizaos/core";
import { ClientBase } from "./base";
import { TwitterApi } from 'twitter-api-v2';


const WATCHER_INSTRUCTION = `
Please find the following data according to the text provided in the following format:
 (1) Token Symbol by json name "token";
 (2) Token Interaction Information by json name "interact";
 (3) Token Interaction Count by json name "count";
 (4) Token Key Event Description by json name "event".
The detail information of each item as following:
 The (1) item is the token/coin/meme name involved in the text provided.
 The (2) item include the interactions(mention/like/comment/repost/post/reply) between each token/coin/meme and the twitter account, the output is "@somebody mention/like/comment/repost/post/reply @token"; providing at most 2 interactions is enough.
 The (3) item is the data of the count of interactions between each token and the twitter account.
 The (4) item is the about 30 words description of the involved event for each token/coin/meme. If the description is too short, please attach the tweets.
Use the list format and only provide these 4 pieces of information.`;

export const watcherCompletionFooter = `\nResponse format should be formatted in a JSON block like this:
[
  { "token": "{{token}}", "interact": {{interact}}, "count": {{count}}, "event": {{event}} }
]
, and no other text should be provided.`;

export const watcherHandlerTemplate =
    // {{goals}}
    `# Action Examples
{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/analysis various forms of text, including HTML, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions:
${settings.AGENT_WATCHER_INSTRUCTION || WATCHER_INSTRUCTION}
` + watcherCompletionFooter;

const TWEET_COUNT_PER_TIME = 20; //count related to timeline
const TWEET_TIMELINE = 60 * 15; //timeline related to count
const TWITTER_COUNT_PER_TIME = 6; //timeline related to count
const GEN_TOKEN_REPORT_DELAY = 1000 * TWEET_TIMELINE;
const SEND_TWITTER_INTERNAL = 1000 * 60 * 60;

export class TwitterWatchClient {
    client: ClientBase;
    runtime: IAgentRuntime;
    consensus: ConsensusProvider;
    inferMsgProvider: InferMessageProvider;

    constructor(client: ClientBase, runtime: IAgentRuntime) {
        this.client = client;
        this.runtime = runtime;
        this.consensus = new ConsensusProvider(this.runtime);
        this.inferMsgProvider = new InferMessageProvider(
            this.runtime.cacheManager
        );
        this.sendingTwitterDebug = false;
    }

    convertTimeToMilliseconds(timeStr: string): number {
        switch (timeStr) {
            case "1h":
                return 1 * 60 * 60 * 1000; // 1 hour in milliseconds
            case "2h":
                return 2 * 60 * 60 * 1000; // 2 hour in milliseconds
            case "3h":
                return 3 * 60 * 60 * 1000; // 3 hours in milliseconds
            case "12h":
                return 12 * 60 * 60 * 1000; // 12 hours in milliseconds
            case "24h":
                return 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            default:
                return 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        }
    }
    generatePrompt(imitate: string, text: string): string {
        let prompt =
            "Here is your personality introduction and Twitter style, and Please imitate the style of the characters below and modify the Twitter content afterwards. Style: ";
        switch (imitate) {
            case "elonmusk":
                prompt +=
                    "Elon Musk is known for his highly innovative and adventurous spirit, with a strong curiosity and drive for pushing boundaries.Elon’s tweets are direct and full of personality. He often posts short, humorous, and at times provocative content.";
                break;

            case "cz_binance":
                prompt +=
                    "CZ is a pragmatic and calm entrepreneur, skilled in handling complex market issues.CZ's tweets are usually concise and informative, focusing on cryptocurrency news, Binance updates, and industry trends.";
                break;

            case "aeyakovenko":
                prompt +=
                    "the founder of Solana, is seen as a highly focused individual who pays close attention to technical details.Yakovenko’s tweets are more technical, often discussing the future development of blockchain technologies, Solana's progress, and major industry challenges. ";
                break;

            case "jessepollak":
                prompt +=
                    "Jesse Pollak is someone with a strong passion for technology and community. He is an active figure in the cryptocurrency community, especially in areas like technical development and user experience, and he has an innovative mindset.Jesse’s tweets are typically concise and easy to understand, showcasing his personal style.";
                break;

            case "shawmakesmagic":
                prompt +=
                    "Shawn is a creative individual who enjoys exploring innovative projects and cutting-edge technologies.His tweets are generally creative, often sharing innovative applications of blockchain technology or topics related to magic, fantasy, and imagination.";
                break;

            case "everythingempt":
                prompt +=
                    "Everythingempt is Openness,Conscientiousness,Extraversion,Agreeableness. Twitter's style is Minimalist,Customized Experience,Selective Content";
                break;

            default:
                break;
        }
        prompt += "Twitter content is after the keyword [Twitter],";
        prompt += "\n[Twitter]:";
        prompt += text;
        prompt += 'Your return result only contains JSON structure: {"resultText": ""}, and no other text should be provided.';
        return prompt;
    }
    ALL_USER_IDS: string = "USER_PROFILE_ALL_IDS_";

    async getAllUserProfiles():  Promise<any[]> {
        // Get all user IDs
        // this.runtime.cacheManager.get("userProfile");
        let idsStr = (await this.runtime.cacheManager.get("USER_PROFILE_ALL_IDS_")) as string;

        if (!idsStr) {
            return [];
        }

        // Parse IDs array
        const ids = JSON.parse(idsStr);
        const existingProfilelist = [];

        for (const id of ids) {
        const profileStr = await this.runtime.cacheManager.get(id) as string;

        if (profileStr) {
            try {
                const existingProfile = JSON.parse(profileStr);
                existingProfilelist.push(existingProfile);
            } catch (error) {
                console.error(`Error parsing profile for id ${id}:`, error);
            }
        }
        }
        return existingProfilelist;
    }
    async runTask() {
        elizaLogger.log("sendTweet in loop, start, 1 looping? " + this.sendingTwitterInLooping);
        if (this.sendingTwitterInLooping) {
            elizaLogger.log("sendTweet in loop, start, 2 looping? " + this.sendingTwitterInLooping);

            return;
        }
        elizaLogger.log("sendTweet in loop, start, 3 looping? " + this.sendingTwitterInLooping);

        this.sendingTwitterInLooping = true;
        elizaLogger.log("sendTweet in loop, start, 4 looping? " + this.sendingTwitterInLooping);

        const userProfiles = await this.getAllUserProfiles();
        elizaLogger.log("sendTweet in loop, userProfiles, len: " + userProfiles?.length);
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i];
            elizaLogger.log("sendTweet in loop, userProfile: ", JSON.stringify(userProfile));
            if (
                !userProfile.agentCfg ||
                !userProfile.agentCfg.interval ||
                !userProfile.agentCfg.imitate
            ) {
                continue;
            }
            const { enabled, interval, imitate } = userProfile.agentCfg;
            if (!enabled) {
                continue;
            }
            if(!(userProfile?.tweetProfile?.accessToken)) {
                elizaLogger.error("sendTweet in loop, Twitter Access token not found");
                continue;
            }
            const lastTweetTime = userProfile.tweetFrequency.lastTweetTime;
            if (
                Date.now() - lastTweetTime >
                (this.sendingTwitterDebug? 60000:
                this.convertTimeToMilliseconds(interval))
            ) {
                userProfile.tweetFrequency.lastTweetTime = Date.now();
                await this.runtime.cacheManager.set(userProfile.username, JSON.stringify(userProfile), {
                    expires: Date.now() + 2 * 60 * 60 * 1000,});
                try {
                    let tweet = await this.inferMsgProvider.getAlphaText();
                    if (tweet) {

                        elizaLogger.log("sendTweet in loop, sendTweet Part0:", tweet);
                        let contentText: string = '';
                        if (typeof tweet === 'string') {
                            contentText = tweet;
                        } else if (Array.isArray(tweet) && tweet.length > 0) {
                            contentText = tweet[tweet.length - 1].text || '';
                        }

                        if(!contentText) {
                            elizaLogger.error("sendTweet in loop, current msg is empty");
                            continue;
                        }
                        // if(contentText.includes(":")) {

                        // }
                        const firstSplit = contentText.split(":");
                        elizaLogger.log("sendTweet in loop, sendTweet Part01:", firstSplit);

                        const part1 = firstSplit[0];
                        const remainingPart = firstSplit.slice(1).join(":");
                        elizaLogger.log("sendTweet in loop, sendTweet Part02:", remainingPart);

                        const actualNewLines = remainingPart.replace(
                            /\\r\\n/g,
                            "\r\n"
                        );
                        const secondSplit = actualNewLines.split("\r\n\r\n");
                        elizaLogger.log("sendTweet in loop, sendTweet Part03:", secondSplit);

                        const part2 = secondSplit[0];
                        elizaLogger.log("sendTweet in loop, sendTweet Part04:", part2);


                        elizaLogger.log("sendTweet in loop, sendTweet Part1:", part1);
                        elizaLogger.log("sendTweet in loop, sendTweet Part2:", part2);

                        const prompt = this.generatePrompt(imitate, part2);
                        elizaLogger.log(
                            "sendTweet in loop Part4: prompt: ",
                            prompt
                        );

                        let responseStr = await generateText({
                            runtime: this.runtime,
                            context: prompt,
                            modelClass: ModelClass.LARGE,
                        });
                        elizaLogger.log(
                            "sendTweet in loop Part4: responseStr: ",
                            responseStr
                        );
                        let responseObj = JSON.parse(responseStr);
                        const { resultText } = responseObj;
                        elizaLogger.log(
                            "sendTweet in loop Part 5: response: ",
                            resultText
                        );

                        await this.sendTweet(
                            resultText,
                            JSON.stringify(userProfile)
                        );
                    } else {
                        elizaLogger.log(
                            "sendTweet in loop msg is null, skip this time"
                        );
                    }
                } catch (error) {
                    elizaLogger.error("sendTweet in loop Sender task: ", error);
                }
            }
        }
        this.sendingTwitterInLooping = false;
    }
    intervalId: NodeJS.Timeout;
    sendingTwitterInLooping: boolean;
    sendingTwitterDebug: boolean;

    async start() {
        console.log("TwitterWatcher start");
        if (!this.client.profile) {
            await this.client.init();
        }
        this.consensus.startNode();

        elizaLogger.log("sendTweet in loop, init");
        this.intervalId = setInterval(
            () => this.runTask(),
            (this.sendingTwitterDebug ? 60000 : SEND_TWITTER_INTERNAL)
        );

        const genReportLoop = async () => {
            console.log("TwitterWatcher loop 001 debug");
            setTimeout(() => {
                genReportLoop(); // Set up next iteration
            }, GEN_TOKEN_REPORT_DELAY);
            console.log("TwitterWatcher loop 002 debug");

            const lastGen = await this.runtime.cacheManager.get<{
                timestamp: number;
            }>(
                "twitter/" +
                    this.runtime.getSetting("TWITTER_USERNAME") +
                    "/lastGen"
            );
            console.log("TwitterWatcher loop 003 debug");

            const lastGenTimestamp = lastGen?.timestamp ?? 0;
            if (Date.now() > lastGenTimestamp + GEN_TOKEN_REPORT_DELAY) {
                console.log("TwitterWatcher loop 004 debug");

                await this.fetchTokens();
                console.log("TwitterWatcher loop 005 debug");

            }
            console.log("TwitterWatcher loop 006 debug");

            console.log(
                `Next tweet scheduled in ${GEN_TOKEN_REPORT_DELAY / 60 / 1000} minutes`
            );
        };
        genReportLoop();
    }

    async fetchTokens() {
        let fetchedTokens = new Map();

        try {
            const currentTime = new Date();
            const timeline =
                Math.floor(currentTime.getTime() / 1000) - TWEET_TIMELINE;
            for (const kolList of [TW_KOL_1, TW_KOL_2, TW_KOL_3]) {
                let kolTweets = [];
                for (const kol of kolList) {
                    //console.log(kol.substring(1));
                    let tweets =
                        await this.client.twitterClient.getTweetsAndReplies(
                            kol.substring(1),
                            60
                        );
                    // Fetch and process tweets
                    try {
                        for await (const tweet of tweets) {
                            if (tweet.timestamp < timeline) {
                                continue; // Skip the outdates.
                            }
                            kolTweets.push(tweet);
                        }
                    } catch (error) {
                        console.error("Error fetching tweets:", error);
                    }
                }
                console.log(kolTweets.length);

                const prompt =
                    `
                Here are some tweets/replied:
                    ${[...kolTweets]
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
                        `)
                        .join("\n")}
                ${settings.AGENT_WATCHER_INSTRUCTION || WATCHER_INSTRUCTION}` +
                watcherCompletionFooter;
                //console.log(prompt);

                let response = await generateText({
                    runtime: this.runtime,
                    context: prompt,
                    modelClass: ModelClass.MEDIUM,
                });
                console.log(response);
                await this.inferMsgProvider.addInferMessage(response);
            }

            // Consensus for All Nodes
            let report = await InferMessageProvider.getLatestReport(
                this.runtime.cacheManager
            );
            await this.consensus.pubMessage(report);

            // // Post Tweet of myself
            // let tweet = await this.inferMsgProvider.getAlphaText();
            // console.log(tweet);
            // await this.sendTweet(tweet);
        } catch (error) {
            console.error("An error occurred:", error);
        }
        return fetchedTokens;
    }

    async sendTweet(tweet: string, cached: string) {
        console.log("TwitterWatcher sendTweet");
        try {
            // Parse the tweet object
            if (cached) {
                // Login with v2
                const profile = JSON.parse(cached);
                if (profile.tweetProfile.accessToken) {
                    // New Twitter API v2 by access token
                    const twitterClient = new TwitterApi(profile.tweetProfile.accessToken);

                    // Check if the client is working
                    const me = await twitterClient.v2.me();
                    console.log('TwitterWatcher sendTweet OAuth2 Success:', me.data);
                    if (me.data) {
                        const tweetResponse = await twitterClient.v2.tweet({text: tweet});
                        console.log('TwitterWatcher sendTweet Tweet result:', tweetResponse);
                    }

                    // Login with v2
                    /*const auth = new TwitterGuestAuth(bearerToken);
                    auth.loginWithV2AndOAuth2(profile.tweetProfile.accessToken);
                    const v2Client = auth.getV2Client();
                    if (v2Client) {
                        const me = await v2Client.v2.me();
                        console.log('OAuth2 Success:', me.data);
                        createCreateTweetRequestV2(tweetData.text, auth);
                    }*/
                    return;
                }
            }

            // Send the tweet self if no OAuth2
            // const result = await this.client.requestQueue.add(
            //     async () =>
            //         await this.client.twitterClient.sendTweet(
            //             tweetData?.text || ""
            //         )
            // );
            // console.log("Tweet result:", result);
        } catch (error) {
            console.error("sendTweet error: ", error);
        }
    }
}
