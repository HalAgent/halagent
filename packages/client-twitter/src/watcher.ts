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
    generateText,
    IAgentRuntime,
    ModelClass,
    settings,
} from "@elizaos/eliza";
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

const GEN_TOKEN_REPORT_DELAY = 1000 * 60 * 60 * 2;
const TWEET_TIMELINE = 60 * 60 * 6;

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
    }

    async start() {
        console.log("TwitterWatcher start");
        if (!this.client.profile) {
            await this.client.init();
        }
        this.consensus.startNode();

        const genReportLoop = async () => {
            console.log("TwitterWatcher loop");
            const lastGen = await this.runtime.cacheManager.get<{
                timestamp: number;
            }>(
                "twitter/" +
                    this.runtime.getSetting("TWITTER_USERNAME") +
                    "/lastGen"
            );

            const lastGenTimestamp = lastGen?.timestamp ?? 0;
            if (Date.now() > lastGenTimestamp + GEN_TOKEN_REPORT_DELAY) {
                await this.fetchTokens();
            }

            setTimeout(() => {
                genReportLoop(); // Set up next iteration
            }, GEN_TOKEN_REPORT_DELAY);

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

            // Post Tweet of myself
            let tweet = await this.inferMsgProvider.getAlphaText();
            console.log(tweet);
            await this.sendTweet(tweet);
        } catch (error) {
            console.error("An error occurred:", error);
        }
        return fetchedTokens;
    }

    async sendTweet(tweet: string) {
        console.log("TwitterWatcher sendTweet");
        try {
            // Parse the tweet object
            const tweetData = JSON.parse(tweet || `{}`);

            const cached = await this.runtime.cacheManager.get("userProfile");
            if (cached) {
                // Login with v2
                const profile = JSON.parse(cached);
                if (profile.tweetProfile.accessToken) {
                    // New Twitter API v2 by access token
                    const twitterClient = new TwitterApi(profile.tweetProfile.accessToken);

                    // Check if the client is working
                    const me = await twitterClient.v2.me();
                    console.log('OAuth2 Success:', me.data);
                    if (me.data) {
                        const tweetResponse = await twitterClient.v2.tweet({text: tweetData.text});
                        console.log('Tweet result:', tweetResponse);
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
            const result = await this.client.requestQueue.add(
                async () =>
                    await this.client.twitterClient.sendTweet(
                        tweetData?.text || ""
                    )
            );
            console.log("Tweet result:", result);
        } catch (error) {
            console.error("sendTweet error: ", error);
        }
    }
}
