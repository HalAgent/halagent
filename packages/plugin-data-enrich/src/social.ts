import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { Scraper } from "agent-twitter-client";

// Pre Defined Twitter KOL
export const TW_KOL_1 = [
    "elonmusk",
    "cz_binance",
    "aeyakovenko",
    "jessepollak",
    "shawmakesmagic",
    "everythingempt0",
];

export const TW_KOL_2 = [
    "aeyakovenko",
    "heyibinance",
    "CryptoHayes",
    "rajgokal",
    "CryptoDaku_",
    "healthy_pockets",
    "StackerSatoshi",
    "TheCryptoLark",
    "CryptoTony__",
];

export const TW_KOL_3 = [
    "jayendra_jog",
    "therealchaseeb",
    "jacobvcreech",
    "gavofyork",
    "lordjorx",
    "Haskell_Gz",
    "Overdose_AI",
    "KriptoErs",
];

export const STYLE_LIST = [
    "Cute",
    "Caring",
    "Emotional",
    "Playful",
    "Logical",
    "Humorous",
    "Cautious",
    //"Professional & Rigorous",
    //"Optimistic & Positive",
    //"Bold & Proactive",
];

export const QUOTES_LIST = [
    "Always remember invest in the feature, not just the present!",
    "The world doesn’t pay you for what you know; it pays you for what you do.",
    "Wise spending is part of wise investing. And it’s never too late to start.",
    "Investing puts money to work. The only reason to save money is to invest it.",
    "If you’re saving, you’re succeeding.",
    "The first rule of compounding: Never interrupt it unnecessarily.",
    "Never depend on a single income. Make an investment to create a second source.",
    "When you invest, you are buying a day that you don’t have to work.",
    "Live within your income and save so you can invest. Learn what you need to learn.",
    "‘Experience’ is what you got when you didn’t get what you wanted.",
    "Invest in yourself. Your career is the engine of your wealth.",
    "Rapidly changing industries are the enemy of the investor.",
    "When you’re in a major market downturn, the beta eats the alpha.",
    "You can’t predict, [but] you can prepare.",
    "If investing wasn’t hard, everyone would be rich.",
    "Never stop investing. Never stop improving. Never stop doing something new.",
    "A great business at a fair price is superior to a fair business at a great price.",
    "In the short run, the market is a voting machine, but in the long run, it is a weighing machine.",
    "I make no attempt to forecast the market—my efforts are devoted to finding undervalued securities.",
];


export const socialProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory, _state?: State) => {

        return `The Twitter KOL List Category 1 is ${TW_KOL_1},
                The Twitter KOL List Category 2 is ${TW_KOL_2},
                The Twitter KOL List Category 3 is ${TW_KOL_3}.
                Please use this as your reference for any twitter-based operations or responses.`;
    },
}

export class twitterDataProvider {

    async fetchTwitterProfile(username: string): Promise<string> {
        try {
            // Create a new instance of the Scraper
            const scraper = new Scraper();

            // Check if login was successful
            if (!await scraper.isLoggedIn()) {
                // Log in to Twitter using the configured environment variables
                await scraper.login(
                    process.env.TWITTER_USERNAME,
                    process.env.TWITTER_PASSWORD,
                    process.env.TWITTER_EMAIL,
                    process.env.TWITTER_2FA_SECRET || undefined
                );

                console.log("Logged in successfully!");
            }

            // Check if login was successful
            if (await scraper.isLoggedIn()) {
                const profile = await scraper.getProfile(username);
                // Log out from Twitter
                await scraper.logout();
                console.log("Logged out successfully!");
                return `The twitter fans of ${username} is ${profile.followersCount}`;
            } else {
                console.log("Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
        return `The twitter fans of ${username} is unknown`;
    }

};
