import type { Address } from "viem";

interface YakSwapQuote {
    amounts: bigint[];
    adapters: Address[];
    path: Address[];
    gasEstimate: bigint;
}

// struct MarketCreationParameters {
//     uint96 tokenType;
//     string name;
//     string symbol;
//     address quoteToken;
//     uint256 totalSupply;
//     uint16 creatorShare;
//     uint16 stakingShare;
//     uint256[] bidPrices;
//     uint256[] askPrices;
//     bytes args;
// }
interface TokenMillMarketCreationParameters {
    tokenType: number;
    name: string;
    symbol: string;
    quoteToken: Address;
    totalSupply: bigint;
    creatorShare: number;
    stakingShare: number;
    bidPrices: bigint[];
    askPrices: bigint[];
    args: string;
}

interface UserResponse {

    id: string;
    createdOn: string;
    twitterId: string;
    twitterHandle: string;
    twitterName: string;
    twitterPicture: string;
    lastLoginTwitterPicture: string;
    bannerUrl: string | null;
    address: string;
    addressBeforeDynamicMigration: string;
    dynamicAddress: string;
    ethereumAddress: string | null;
    solanaAddress: string;
    prevAddress: string;
    addressConfirmed: boolean;
    twitterDescription: string;
    signedUp: boolean;
    subscriptionCurrency: string;
    subscriptionCurrencyAddress: string | null;
    subscriptionPrice: string;
    keyPrice: string;
    lastKeyPrice: string;
    threadCount: number;
    followerCount: number;
    followingsCount: number;
    twitterFollowers: number;
    subscriptionsEnabled: boolean;
    userConfirmed: boolean;
    twitterConfirmed: boolean;
    flag: number;
    ixHandle: string;
    handle: string | null;
    following: boolean | null;
    follower: boolean | null;
}

export type { YakSwapQuote, TokenMillMarketCreationParameters, UserResponse };
