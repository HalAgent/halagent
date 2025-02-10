/**
 * Binance API response for kline data endpoint
 */
export type BinanceKlineResponse = Array<
  [
    number,       // Kline open time
    string,       // Open price
    string,       // High price
    string,       // Low price
    string,       // Close price
    string,       // Volume
    number,       // Kline Close time
    string,       // Quote asset volume
    number,       // Number of trades
    string,       // Taker buy base asset volume
    string,       // Taker buy quote asset volume
    string        // Unused field, ignore
  ]
>;
