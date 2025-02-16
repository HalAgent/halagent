import {
    type Action,
    type ActionExample,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    elizaLogger,
    type Content,
  } from "@elizaos/core";
  import { UserResponse } from "../types";

  export interface ProfileContent extends Content {
    depositTokenAddress: string;
    strategyAddress: string;
    amount: string | number;
  }

  export default {
    name: "PROFILE_CHECK",
    similes: ["DEPOSIT_FOR_AVALANCHE", "DEPOSIT_PROFILE"],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "get arena socila info.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<UserResponse> => {

      elizaLogger.log("Starting PROFILE_CHECK handler...");
      const username = _options['kolname'] as string;
      try {
        const baseUrl = 'https://api.starsarena.com/user/handle';
        const response = await fetch(`${baseUrl}?handle=${username}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          return null;
        }
        const data = await response.json();
        const userinfo = data?.user;
        if (userinfo) {
          return userinfo as UserResponse;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
      return null;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Deposit 1 USDC into the strategy" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Deposit 10 gmYAK to earn yield" },
            },
        ],
    ] as ActionExample[][],
  } as Action;
