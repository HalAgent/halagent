/**
 * Binance service configuration
 */
export interface BinanceConfig {
    apiKey?: string;
    secretKey?: string;
    baseURL?: string;
    timeout?: number;
}

/**
 * Service options that can be passed to any service method
 */
export interface ServiceOptions {
    timeout?: number;
    recvWindow?: number;
}

/**
 * Price check request parameters
 */
export interface PriceCheckRequest {
    symbol: string;
    quoteCurrency: string;
}

/**
 * Price response data
 */
export interface PriceResponse {
    symbol: string;
    price: string;
    timestamp: number;
}

/**
 * Spot trade request parameters
 */
export interface SpotTradeRequest {
    symbol: string;
    side: "BUY" | "SELL";
    type: "MARKET" | "LIMIT";
    quantity: number;
    price?: number;
    timeInForce?: "GTC" | "IOC" | "FOK";
}

/**
 * Trade response data
 */
export interface TradeResponse {
    symbol: string;
    orderId: number;
    status: string;
    executedQty: string;
    cummulativeQuoteQty: string;
    price: string;
    type: string;
    side: string;
}

/**
 * Balance check request parameters
 */
export interface BalanceCheckRequest {
    asset?: string;
}

/**
 * Balance response data
 */
export interface BalanceResponse {
    balances: Array<{
        asset: string;
        free: string;
        locked: string;
    }>;
    timestamp: number;
}

/**
 * Kline check request parameters
 */
export interface KlineCheckRequest {
    symbol: string;
    interval: string;
}

/**
 * Kline response data
 * [
    1499040000000,      // Kline open time
    "0.01634790",       // Open price
    "0.80000000",       // High price
    "0.01575800",       // Low price
    "0.01577100",       // Close price
    "148976.11427815",  // Volume
    1499644799999,      // Kline Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "0"                 // Unused field, ignore.
  ]
 */
export interface KlineResponse {
    symbol: string; // Symbol
    klines: Array<{
        openTime: number;      // Kline open time
        openPrice: string;     // Open price
        highPrice: string;     // High price
        lowPrice: string;      // Low price
        closePrice: string;    // Close price
        volume: string;        // Volume
        closeTime: number;     // Kline Close time
        quoteVolume: string;   // Quote asset volume
        trades: number;        // Number of trades
        buyVolume: string;     // Taker buy base asset volume
        buyQuoteVolume: string;// Taker buy quote asset volume
    }>;
}
