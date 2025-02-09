import {
    type ActionExample,
    elizaLogger,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    type Action,
} from "@elizaos/core";
import { BinanceService } from "../services";
import { KlineResponse } from "../types/internal/config";

export const KlineCheck: Action = {
    name: "GET_KLINE",
    similes: [
        "GET_KLINE",
    ],
    description: "Get current kline information for a cryptocurrency pair",
    validate: async () => true, // Public endpoint
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: Record<string, unknown>,
        callback?: HandlerCallback
    ): Promise<KlineResponse> => {
        try {
            const coinsymbol = _options['symbol'] as string;
            const binanceService = new BinanceService({
                apiKey: runtime.getSetting("BINANCE_API_KEY"),
                secretKey: runtime.getSetting("BINANCE_SECRET_KEY"),
                });
            const klineData = await binanceService.getKline({symbol: coinsymbol + "USDT", interval: "1d"});
            // console.log("handleBnbQuery, in fungbnb. action.handler kilneData: ", JSON.stringify(klineData));
            if (!(klineData?.klines.length > 0)) {
                console.error("handleBnbQuery, in fungbnb. KlineResponse: " + JSON.stringify(klineData));
            }
            if (callback) {
                callback({
                    text: `The current`,
                    content: klineData,
                });
            }
            return klineData;
        } catch (error) {
            elizaLogger.error("Error in price check:", error);
            if (callback) {
                const errorMessage = error.message.includes("Invalid API key")
                    ? "Unable to connect to Binance API"
                    : error.message.includes("Invalid symbol")
                      ? "Sorry, could not find price for the cryptocurrency symbol you provided"
                      : `Sorry, I encountered an error: ${error.message}`;

                callback({
                    text: errorMessage,
                    content: { error: error.message },
                });
            }
            return null;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's the current kline of Bitcoin?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll check the current Bitcoin kilne for you right away.",
                    action: "GET_PRICE",
                },
            }
        ]
    ] as ActionExample[][],
} as Action;
