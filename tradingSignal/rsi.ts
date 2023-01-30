import Big, {BigSource} from 'big.js';
import {MovingAverage} from './MA/MovingAverage';
import {BigIndicatorSeries} from './Indicator';
import {MovingAverageTypes} from './MA/MovingAverageTypes';
import {WSMA} from './WSMA/WSMA';

/**
 * Relative Strength Index (RSI)
 * Type: Momentum
 *
 * The Relative Strength Index (RSI) is an oscillator that ranges between 0 and 100. The RSI can be used to find trend
 * reversals, i.e. when a downtrend doesn't generate a RSI below 30 and rallies above 70 it could mean that a trend
 * reversal to the upside is taking place. Trend lines and moving averages should be used to validate such statements.
 *
 * The RSI is mostly useful in markets that alternate between bullish and bearish movements.
 *
 * A RSI value of 30 or below indicates an oversold condition (not a good time to sell because there is an oversupply).
 * A RSI value of 70 or above indicates an overbought condition (sell high opportunity because market may correct the
 * price in the near future).
 *
 * @see https://en.wikipedia.org/wiki/Relative_strength_index
 * @see https://www.investopedia.com/terms/r/rsi.asp
 */

export class RSI extends BigIndicatorSeries {
  private previousPrice?: BigSource;
  private readonly avgGain: MovingAverage;
  private readonly avgLoss: MovingAverage;
  private readonly maxValue = new Big(100);

  constructor(public readonly interval: number, SmoothingIndicator: MovingAverageTypes = WSMA) {
    super();
    this.avgGain = new SmoothingIndicator(this.interval);
    this.avgLoss = new SmoothingIndicator(this.interval);
  }

  override update(price: BigSource): void | Big {
    // console.log('Price in RSI: ', price, 'Previous Price in RSI: ', this.previousPrice);

    if (!this.previousPrice) {
      // At least 2 prices are required to do a calculation
      this.previousPrice = price;
      return;
    }

    const currentPrice = new Big(price);
    const previousPrice = new Big(this.previousPrice);

    // Update average gain/loss
    if (currentPrice.gt(previousPrice)) {
      this.avgLoss.update(new Big(0)); // price went up, therefore no loss
      this.avgGain.update(currentPrice.sub(previousPrice));
    } else {
      this.avgLoss.update(previousPrice.sub(currentPrice));
      this.avgGain.update(new Big(0)); // price went down, therefore no gain
    }

    this.previousPrice = price;

    if (this.avgGain.isStable) {
      const avgLoss = this.avgLoss.getResult();
      // Prevent division by zero: https://github.com/bennycode/trading-signals/issues/378
      if (avgLoss.eq(0)) {
        return this.setResult(new Big(100));
      }
      // console.log('RSI: ', this.avgGain.getResult().valueOf(), this.avgLoss.getResult().valueOf());
      const relativeStrength = this.avgGain.getResult().div(avgLoss);
      return this.setResult(this.maxValue.minus(this.maxValue.div(relativeStrength.add(1))));
    }
  }
}
