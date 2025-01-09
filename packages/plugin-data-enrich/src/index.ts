import { elizaLogger } from "@elizaos/eliza";
import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    Plugin,
    State,
} from "@elizaos/eliza";

import { socialProvider, QUOTES_LIST, STYLE_LIST, TW_KOL_1, TW_KOL_2, TW_KOL_3 } from "./social.ts";
import {
    TOP_TOKENS,
    topTokenProvider,
    TokenDataProvider,
    tokenWatcherConversationTemplate
} from "./tokendata.ts";
import {
    InferMessageProvider
} from "./infermessage.ts";
import {
    ConsensusProvider
} from "./consensus.ts";


const dataEnrich: Action = {
    name: "DATA_ENRICH",
    similes: [
        "ENRICH_DATA",
        "INTERNET_DATA",
        "DATA_LOOKUP",
        "QUERY_API",
        "QUERY_DATA",
        "FIND_REALTIME_DATA",
        "DATABASE_SEARCH",
        "FIND_MORE_INFORMATION",
    ],
    description:
        "Perform a web search to find information related to the message.",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        elizaLogger.log("Composing state for message:", message);
        state = (await runtime.composeState(message)) as State;
        const userId = runtime.agentId;
        elizaLogger.log("User ID:", userId);

        const webSearchPrompt = message.content.text;
        elizaLogger.log("Data-enrich prompt received:", webSearchPrompt);

    },
    examples: [
    ],
} as Action;

export const dataEnrichPlugin: Plugin = {
    name: "dataEnrich",
    description: "Query detail info by API/DB",
    actions: [dataEnrich],
    evaluators: [],
    providers: [socialProvider, topTokenProvider],
};

export {
    ConsensusProvider,
    InferMessageProvider,
    socialProvider,
    TOP_TOKENS, TokenDataProvider,
    tokenWatcherConversationTemplate,
    QUOTES_LIST, STYLE_LIST,
    TW_KOL_1, TW_KOL_2, TW_KOL_3
};
