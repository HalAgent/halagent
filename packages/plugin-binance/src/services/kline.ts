import { VALIDATION } from "../constants/defaults";
import { ERROR_MESSAGES } from "../constants/errors";
import type { BinanceKlineResponse } from "../types/api/kline";
import type { KlineCheckRequest, KlineResponse } from "../types/internal/config";
import { BinanceError } from "../types/internal/error";
import { BaseService } from "./base";

/**
 * Service for handling klines-related operations
 */
export class KlineService extends BaseService {
    /**
     * Get current klines for a symbol
     */
    async getKlines(request: KlineCheckRequest): Promise<KlineResponse> {
        try {
            this.validateSymbol(request.symbol);

            const symbol = request.symbol;
            const interval = request.interval;
            const response = await this.client.klines(symbol, interval);
            const data = response.data as BinanceKlineResponse;

            const klines = data.map(kline => ({
                openTime: kline[0],
                openPrice: kline[1],
                highPrice: kline[2],
                lowPrice: kline[3],
                closePrice: kline[4],
                volume: kline[5],
                closeTime: kline[6],
                quoteVolume: kline[7],
                trades: kline[8],
                buyVolume: kline[9],
                buyQuoteVolume: kline[10],
            }));
        
            // KlineResponse
            return {
                symbol: request.symbol,
                klines,
            };
        } catch (error) {
            throw this.handleError(error, request.symbol);
        }
    }

    /**
     * Validates symbol format
     */
    private validateSymbol(symbol: string): void {
        const trimmedSymbol = symbol.trim();
        if (
            trimmedSymbol.length < VALIDATION.SYMBOL.MIN_LENGTH ||
            trimmedSymbol.length > VALIDATION.SYMBOL.MAX_LENGTH
        ) {
            throw new BinanceError(ERROR_MESSAGES.INVALID_SYMBOL);
        }
    }
}
