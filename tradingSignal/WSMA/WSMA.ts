import Big, {BigSource} from 'big.js';
import {MovingAverage} from '../MA/MovingAverage';
import {SMA} from '../SMA/SMA';

/**
 * Wilder's Smoothed Moving Average (WSMA)
 * Type: Trend
 *
 * Developed by **John Welles Wilder, Jr.** to help identifying and spotting bullish and bearish trends. Similar to
 * Exponential Moving Averages with the difference that a smoothing factor of 1/interval is being used, which makes it
 * respond more slowly to price changes.
 *
 * Synonyms:
 * - Modified Exponential Moving Average (MEMA)
 * - Smoothed Moving Average (SMMA)
 * - Welles Wilder's Smoothing (WWS)
 * - Wilder's Moving Average (WMA)
 *
 * @see https://tlc.thinkorswim.com/center/reference/Tech-Indicators/studies-library/V-Z/WildersSmoothing
 */
export class WSMA extends MovingAverage {
    private readonly indicator: SMA;
    private readonly smoothingFactor: Big;

    constructor(public readonly interval: number) {
        super(interval);
        this.indicator = new SMA(interval);
        this.smoothingFactor = new Big(1).div(this.interval);
    }

    update(price: BigSource): Big | void {
        const sma = this.indicator.update(price);
        
        // console.log('Price in WSMA: ', price.valueOf());
        if (this.result) {
            // console.log('WSMA with result: ', price.valueOf(), this.result.valueOf(), this.smoothingFactor.valueOf());
            const smoothed = new Big(price).minus(this.result).mul(this.smoothingFactor);
            return this.setResult(smoothed.plus(this.result));
        } else if (this.result === undefined && sma) {
            // console.log('WSMA without result: ', sma.valueOf());
            return this.setResult(sma);
        }
    }
}