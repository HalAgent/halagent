import {
    TW_KOL_1,
    UserManager,
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
import {
    ApiV2Includes,
    TweetV2,
    TwitterApi,
    TTweetv2Expansion,
    //TTweetv2MediaField,
    //TTweetv2PlaceField,
    TTweetv2PollField,
    TTweetv2TweetField,
    TTweetv2UserField,
    UserV2,
  } from 'twitter-api-v2';
  import { Tweet } from "agent-twitter-client";

const WATCHER_INSTRUCTION = `
Please find the following data according to the text provided in the following format:
 (1) Token Symbol by json name "token";
 (2) Token Interaction Information by json name "interact";
 (3) Token Interaction Count by json name "count";
 (4) Token Key Event Description by json name "event".
The detail information of each item as following:
 The (1) item is the token/coin/meme name involved in the text provided.
 The (2) item include the interactions(mention/like/comment/repost/post/reply) between each token/coin/meme and the twitter account, the output is "@somebody mention/like/comment/repost/post/reply @token"; providing at most 1 interactions is enough.
 The (3) item is the data of the count of interactions between each token and the twitter account.
 The (4) item is the about 30 words description of the involved event for each token/coin/meme. If the description is too short, please attach the tweets.
Please skip the top token, such as btc, eth, sol, base, bnb.
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
    userManager: UserManager;

    constructor(client: ClientBase, runtime: IAgentRuntime) {
        this.client = client;
        this.runtime = runtime;
        this.consensus = new ConsensusProvider(this.runtime);
        this.inferMsgProvider = new InferMessageProvider(
            this.runtime, this.client.twitterClient
        );
        this.userManager = new UserManager(this.runtime.cacheManager);
        this.sendingTwitterInLooping = false;
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
    async runTask() {
        console.log("sendTweet in loop, enter loop");
        if (this.sendingTwitterInLooping) {
            console.log("sendTweet in loop, is looping, skip this time");
            return;
        }
        this.sendingTwitterInLooping = true;
        // const userManager = new UserManager(this.runtime.cacheManager);
        const userProfiles = await this.userManager.getAllUserProfiles();
        console.log("sendTweet in loop, enter loop, len: " + userProfiles.length);

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i];
            console.log("sendTweet in loop, enter loop, userprofile: " , userProfile);
            if (
                !userProfile.agentCfg ||
                !userProfile.agentCfg.interval ||
                !userProfile.agentCfg.imitate
            ) {
                console.log("sendTweet in loop, agent cfg is illegality");
                continue;
            }
            const { enabled, interval, imitate } = userProfile.agentCfg;
            if (!enabled) {
                console.log("sendTweet in loop, agent cfg is not enable");
                continue;
            }
            if(!(userProfile?.tweetProfile?.accessToken)) {
                console.log("sendTweet in Loop Twitter Access token not found");
                continue;
                //throw new Error("Send Twitter in Loop Twitter Access token not found");
            }
            const lastTweetTime = userProfile.tweetFrequency.lastTweetTime;
            if (
                Date.now() - lastTweetTime >
                (this.sendingTwitterDebug? 60000:
                this.convertTimeToMilliseconds(interval))
            ) {
                userProfile.tweetFrequency.lastTweetTime = Date.now();
                this.userManager.saveUserData(userProfile);
                try {
                    let tweet =
                        await InferMessageProvider.getAllWatchItemsPaginated(
                            this.runtime.cacheManager
                        );
                    if (tweet) {
                        let len = tweet?.items.length;
                        if (len <= 0) {
                            console.log("sendTweet in Loop, tweet is empyt");
                            continue;
                        }

                        let contentText = tweet?.items[len - 1].text;
                        const firstSplit = contentText.split(":");
                        const part1 = firstSplit[0];
                        const remainingPart = firstSplit.slice(1).join(":");

                        const actualNewLines = remainingPart.replace(
                            /\\r\\n/g,
                            "\r\n"
                        );
                        const secondSplit = actualNewLines.split("\r\n\r\n");

                        const part2 = secondSplit[0];
                        const part3 = secondSplit.slice(1).join("  ").trim();

                        // console.log("Watcher sendTweet Part1:", part1);
                        // console.log("Watcher sendTweet Part2:", part2);
                        // console.log("Watcher sendTweet Part3:", part3);

                        const prompt = this.generatePrompt(imitate, part2);
                        console.log(
                            "sendTweet in loop Part4: prompt: ",
                            prompt
                        );

                        let responseStr = await generateText({
                            runtime: this.runtime,
                            context: prompt,
                            modelClass: ModelClass.LARGE,
                        });
                        console.log(
                            "sendTweet in loop Part4: responseStr: ",
                            responseStr
                        );
                        let responseObj = JSON.parse(responseStr);
                        const { resultText } = responseObj;
                        console.log(
                            "sendTweet in loop Part 5: response: ",
                            resultText
                        );

                        await this.sendTweet(
                            resultText,
                            JSON.stringify(userProfile)
                        );
                    } else {
                        console.log(
                            "sendTweet in loop msg is null, skip this time"
                        );
                    }
                } catch (error) {
                    console.error("sendTweet in loop Sender task: ", error);
                }
            } else {
                console.log("sendTweet in loop, too frequent, skip this time");
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

        this.intervalId = setInterval(
            () => this.runTask(),
            (this.sendingTwitterDebug ? 120000 : SEND_TWITTER_INTERNAL)
        );
        const genReportLoop = async () => {
            elizaLogger.log("TwitterWatcher loop");
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
            }, (this.sendingTwitterDebug ? 50000 : GEN_TOKEN_REPORT_DELAY));

            console.log(
                `Next tweet scheduled in ${GEN_TOKEN_REPORT_DELAY / 60 / 1000} minutes`
            );
        };
        genReportLoop();
    }

    async getKolList() {
        // TODO: Should be a unipool shared by all users.
        //return JSON.parse(settings.TW_KOL_LIST) || TW_KOL_1;
        // const userManager = new UserManager(this.runtime.cacheManager);
        return await this.userManager.getAllWatchList();
    }

    // get the following list
    async setFollowingChanged(username: string,
        followingList: string[], preFollowingList: string[]) {
        const changedList = followingList.filter(item => !preFollowingList.includes(item));
        //console.log(changedList);
        if (changedList && changedList.length > 0) {
            //await this.inferMsgProvider.addFollowingChangeMessage(kol,
            //    ` for changing about ${twProfile.followingCount - followingCount} new followings, please check.`)
            const output = `[${changedList.map(item => `@${item}`).join(', ')}]`;
            console.log(output);
            await this.inferMsgProvider.addFollowingChangeMessage(username,
                ` for changing ${changedList.length} new followings of ${output}.`);
        }

    }

    async fetchTokens() {
        let fetchedTokens = new Map();

        try {
            const currentTime = new Date();
            //const timeline =
            //    Math.floor(currentTime.getTime() / 1000) -
            //    TWEET_TIMELINE -
            //    60 * 60 * 24;
            const kolList = await this.getKolList();
            let index = 0;
            for (const kol of kolList) {
                const { timestamp, tweetsCount, followingCount, followingList } = await this.userManager.getTwitterScrapData(kol);
                const twProfile = await this.client.twitterClient.getProfile(kol);
                let newFollowingList: string[] = [];
                if (followingCount != 0 && followingCount < twProfile.followingCount) {
                    //TODO: the delete of the followings
                    // Get the change of followingCount
                    const followings = await this.client.twitterClient.fetchProfileFollowing(twProfile.userId, 10);
                    newFollowingList = followings.profiles.map(item => item.username);
                    if (followingList.length > 0) {
                        await this.setFollowingChanged(kol, newFollowingList, followingList);
                    }
                    await this.userManager.setTwitterScrapData(kol, timestamp,
                        twProfile.tweetsCount, twProfile.followingCount, newFollowingList);
                }
                console.log(timestamp);
                if (tweetsCount == twProfile.tweetsCount) {
                    console.log(`Skip for ${kol}, ${tweetsCount} - ${twProfile.tweetsCount}`)
                    continue; // TODO for tweet delete
                }
                console.log("fetching...");
                let latestTimestamp = timestamp;
                let kolTweets = [];
                let tweets = [];
                if (index++ < TWITTER_COUNT_PER_TIME) {
                    tweets = await this.client.twitterClient.getTweetsAndReplies(
                        kol,
                        TWEET_COUNT_PER_TIME
                    );
                }
                else {
                    tweets = await this.getTweetV2(kol, TWEET_COUNT_PER_TIME);
                    console.log(tweets.length);
                }
                // Fetch and process tweetsss
                try {
                    for await (const tweet of tweets) {
                        if (tweet.timestamp > latestTimestamp) {
                            latestTimestamp = tweet.timestamp;
                        }
                        if (tweet.timestamp <= timestamp) {
                            continue; // Skip the outdates.
                        }
                        kolTweets.push(tweet);
                    }
                } catch (error) {
                    console.error("Error fetching tweets:", error);
                    console.log(`kol ${kol} not found`);
                    continue;
                }
                console.log(kolTweets.length);
                await this.userManager.setTwitterScrapData(kol, latestTimestamp,
                    twProfile.tweetsCount, twProfile.followingCount, newFollowingList);
                if (kolTweets.length < 1) {
                    continue;
                }

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
                        `
                        )
                        .join("\n")}
                ${settings.AGENT_WATCHER_INSTRUCTION || WATCHER_INSTRUCTION}` +
                    watcherCompletionFooter;
                //console.log("generateText for db, before: " + prompt);

                let response = await generateText({
                    runtime: this.runtime,
                    context: prompt,
                    modelClass: ModelClass.LARGE,
                });
                //console.log("generateText for db, after: " + response);
                await this.inferMsgProvider.addInferMessage(kol, response);
            }

            // Consensus for All Nodes
            let report = await InferMessageProvider.getLatestReport(
                this.runtime.cacheManager
            );
            await this.consensus.pubMessage(report);

            // try {
            //     let tweet = await InferMessageProvider.getAllWatchItemsPaginated(this.runtime.cacheManager);
            //     if (tweet) {
            //     elizaLogger.log("Twitter Sender2 msg:" + tweet);
            //     await this.sendTweet(JSON.stringify(tweet?.items[0]));
            //     } else {
            //     elizaLogger.log("Twitter Sender2 msg is null, skip this time");
            //     }
            // } catch (error: any) {
            //     elizaLogger.error("Twitter Sender2 err: ", error.message);
            // }
        } catch (error) {
            console.error("An error occurred:", error);
        }
        return fetchedTokens;
    }

    async sendReTweet(tweed: string, userId: any) {
        //const userManager = new UserManager(this.runtime.cacheManager);
        const profile = await this.userManager.verifyExistingUser(userId);
        if(!(profile?.tweetProfile?.accessToken)) {
            console.error("sendTweet in share Twitter Access token not found");
            return;
            // throw new Error("Twitter Access token not found");
        }
        const firstSplit = tweed.split(":");
        const part1 = firstSplit[0];
        const remainingPart = firstSplit.slice(1).join(":");
        const actualNewLines = remainingPart.replace(/\\r\\n/g, "\r\n");
        const secondSplit = actualNewLines.split("\r\n\r\n");

        const part2 = secondSplit[0];
        const part3 = secondSplit.slice(1).join("  ").trim();
        //console.log("Watcher reTweet Part1: ", part1);
        //console.log("Watcher reTweet Part2: ", part2);
        //console.log("Watcher reTweet Part3: ", part3);

        const prompt = this.generatePrompt(profile.agentCfg?.imitate, part2);
        // console.log("Watcher reTweet Part4: prompt: ", prompt);

        let responseStr = await generateText({
            runtime: this.runtime,
            context: prompt,
            modelClass: ModelClass.LARGE,
        });

        console.log(
            "sendTweet in share Part5: responseStr: ",
            responseStr
        );
        let responseObj = JSON.parse(responseStr);

        const { resultText } = responseObj;
        console.log("sendTweet in share Part7: resultText: ", resultText);
        let finalResult = part1 + ":" + resultText + "\n\n" + part3;
        this.sendTweet(finalResult, JSON.stringify(profile));
    }

    async sendTweet(tweetDataText: string, cached: string) {
        console.log("sendTweet in sending tweetDataText: " + tweetDataText);
        try {
            // Parse the tweet object
            //const tweetData = JSON.parse(tweet || `{}`);
            if (!tweetDataText) {
                return;
            }
            //const cached = await this.runtime.cacheManager.get("userProfile");
            if (cached) {
                // Login with v2
                const profile = JSON.parse(cached);
                if (profile && profile.tweetProfile.accessToken) {
                    let twitterClient = await this.getTwitterClient(
                        profile.tweetProfile.accessToken,
                        profile.tweetProfile.refreshToken,
                    );
                    if (twitterClient) {
                        const tweetResponse = await twitterClient.v2.tweet({
                            text: tweetDataText,
                        });
                        console.log(
                            "sendTweet in sending v2 result: ",
                            tweetResponse
                        );
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
            //         await this.client.twitterClient.sendTweet(tweetDataText)
            // );
            // console.log("Watcher sendTweet v1 result:", result);
        } catch (error) {
            console.error("sendTweet in sending error: ", error);
        }
    }

    // Get the TwitterAPI Client by accessToken or refreshToken
    async getTwitterClient(accessToken: string, refreshToken: string): Promise<TwitterApi> {
        console.log("Watcher getTwitterClinet");
        try {
            let twitterClient = null;
            let me = null;
            try {
                // New Twitter API v2 by access token
                twitterClient = new TwitterApi(accessToken);

                // Check if the client is working
                me = await twitterClient.v2.me();
                console.log("sendTweet in sending v2 auth Success: ", me.data);
            } catch (err) {
                console.log(err);
                console.log(err.code);
                //refesh token
                const clientRefresh = new TwitterApi({
                    clientId: settings.TWITTER_CLIENT_ID,
                    clientSecret: settings.TWITTER_CLIENT_SECRET,
                    refreshToken
                });
                const { accessToken: newToken } = await clientRefresh.refreshOAuth2Token(
                    refreshToken
                );
                if (!newToken) {
                    console.error("refresh token error");
                }
                twitterClient = new TwitterApi(newToken);
                me = await twitterClient.v2.me();
            }
            if (me && me.data) {
                return twitterClient;
            }
        } catch (error) {
            console.error("getTwitterClinet error: ", error);
        }
        return null;
    }

    // Get Tweet by V2 per user
    async getTweetV2(kolname: string, count: number) {
        console.log("Watcher getTweetV2");
        try {
            const { accessToken, refreshToken } = await this.userManager.getUserTwitterAccessTokenSequence();
            if (accessToken && refreshToken) {
                // New Twitter API v2 by access token
                const twitterClient = await this.getTwitterClient(accessToken, refreshToken);
                if (twitterClient) {
                    const params = {
                        max_results: count, // 5-100
                        pagination_token: undefined,
                        //exclude: [],
                        expansions: defaultOptions.expansions,
                        'tweet.fields': defaultOptions.tweetFields,
                        'user.fields': defaultOptions.userFields,
                    };
                    const kolid = await this.client.twitterClient.getUserIdByScreenName(kolname);
                    const tweets = await twitterClient.v2.userTimeline(kolid, params);
                    //console.log("getTweetV2 result: ", tweets);
                    return tweets._realData?.data.map((tweet: TweetV2) => parseTweetV2ToV1(tweet, tweets._realData?.includes));
                }
            }

        } catch (error) {
            console.error("Watcher getTweetV2 error: ", error);
        }
        return [];
    }
}

export const defaultOptions = {
    expansions: [
      'attachments.poll_ids',
      'attachments.media_keys',
      'author_id',
      'referenced_tweets.id',
      'in_reply_to_user_id',
      'edit_history_tweet_ids',
      'geo.place_id',
      'entities.mentions.username',
      'referenced_tweets.id.author_id',
    ] as TTweetv2Expansion[],
    tweetFields: [
      'attachments',
      'author_id',
      'context_annotations',
      'conversation_id',
      'created_at',
      'entities',
      'geo',
      'id',
      'in_reply_to_user_id',
      'lang',
      'public_metrics',
      'edit_controls',
      'possibly_sensitive',
      'referenced_tweets',
      'reply_settings',
      'source',
      'text',
      'withheld',
      'note_tweet',
    ] as TTweetv2TweetField[],
    pollFields: [
      'duration_minutes',
      'end_datetime',
      'id',
      'options',
      'voting_status',
    ] as TTweetv2PollField[],
    userFields: [
      'created_at',
      'description',
      'entities',
      'id',
      'location',
      'name',
      'profile_image_url',
      'protected',
      'public_metrics',
      'url',
      'username',
      'verified',
      'withheld',
    ] as TTweetv2UserField[],
};

function parseTweetV2ToV1(
    tweetV2: TweetV2,
    includes?: ApiV2Includes,
    defaultTweetData?: Tweet | null,
  ): Tweet {
    let parsedTweet: Tweet;
    if (defaultTweetData != null) {
      parsedTweet = defaultTweetData;
    }
    parsedTweet = {
      id: tweetV2.id,
      text: tweetV2.text ?? defaultTweetData?.text ?? '',
      hashtags:
        tweetV2.entities?.hashtags?.map((tag) => tag.tag) ??
        defaultTweetData?.hashtags ??
        [],
      mentions:
        tweetV2.entities?.mentions?.map((mention) => ({
          id: mention.id,
          username: mention.username,
        })) ??
        defaultTweetData?.mentions ??
        [],
      urls:
        tweetV2.entities?.urls?.map((url) => url.url) ??
        defaultTweetData?.urls ??
        [],
      likes: tweetV2.public_metrics?.like_count ?? defaultTweetData?.likes ?? 0,
      retweets:
        tweetV2.public_metrics?.retweet_count ?? defaultTweetData?.retweets ?? 0,
      replies:
        tweetV2.public_metrics?.reply_count ?? defaultTweetData?.replies ?? 0,
      views:
        tweetV2.public_metrics?.impression_count ?? defaultTweetData?.views ?? 0,
      userId: tweetV2.author_id ?? defaultTweetData?.userId,
      conversationId: tweetV2.conversation_id ?? defaultTweetData?.conversationId,
      photos: defaultTweetData?.photos ?? [],
      videos: defaultTweetData?.videos ?? [],
      poll: defaultTweetData?.poll ?? null,
      username: defaultTweetData?.username ?? '',
      name: defaultTweetData?.name ?? '',
      place: defaultTweetData?.place,
      thread: defaultTweetData?.thread ?? [],
    };

    // Process Polls
    if (includes?.polls?.length) {
      const poll = includes.polls[0];
      parsedTweet.poll = {
        id: poll.id,
        end_datetime: poll.end_datetime
          ? poll.end_datetime
          : defaultTweetData?.poll?.end_datetime
          ? defaultTweetData?.poll?.end_datetime
          : undefined,
        options: poll.options.map((option) => ({
          position: option.position,
          label: option.label,
          votes: option.votes,
        })),
        voting_status:
          poll.voting_status ?? defaultTweetData?.poll?.voting_status,
      };
    }

    // Process User (for author info)
    if (includes?.users?.length) {
      const user = includes.users.find(
        (user: UserV2) => user.id === tweetV2.author_id,
      );
      if (user) {
        parsedTweet.username = user.username ?? defaultTweetData?.username ?? '';
        parsedTweet.name = user.name ?? defaultTweetData?.name ?? '';
      }
    }

    // TODO: Process Thread (referenced tweets) and remove reference to v1
    return parsedTweet;
}