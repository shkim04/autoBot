require('dotenv').config();
import Binance, { OrderType } from 'binance-api-node';
import {RSI} from './tradingSignal/rsi';

const client = Binance({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    getTime: Date.now
});

const PERIOD = 14;
const OVERBOUGHT = 70;
const OVERSOLD = 30;
const btcRsi = new RSI(PERIOD);
const btcSymbol = 'BTCUSDT'; 

let lowest = 0;
let recentHigh = 0;
let higherLow = 0;
const crossAboveOffset = 35;
const higherLowOffset = 33;
const buyAfterCrossAbove = 37;

let highest = 0;
let recentLow = 0;
let lowerHigh = 0;
const crossBelowOffset = 63;
const lowerHighOffset = 65;
const sellAfterCrossBelow = 62;

let isFirstRun = true;
let previousRsi: any[] = [];

async function bot() {
    try { 
        let btcData = await client.prices({ symbol: btcSymbol });
        let btcPrice = btcData[btcSymbol];

        if(isFirstRun) {
            console.log('First run!');
            let btcCandles = await client.candles({ symbol: btcSymbol, interval: '6h', limit: 50 });

            for(let i = 0; i < btcCandles.length; i++) {
                btcRsi.update(btcCandles[i].close);
            }

            

            isFirstRun = false;
        }
        else {
            btcRsi.update(btcPrice);
        }

        let latestRsi = parseFloat(btcRsi.getResult().toFixed(2));
        let accountInfoData = await client.accountInfo();
        let btcBalance = accountInfoData.balances.find(b => b.asset === 'BTC')?.free || '0';
        let usdtBalance = accountInfoData.balances.find(b => b.asset === 'USDT')?.free || '0';
        let sellQty = parseFloat(btcPrice) * parseFloat(btcBalance);
        let inPosition = btcBalance !== '0' ? true : false;

        let isStillUpTrend = previousRsi.length > 5 && 
                            previousRsi.find(rsi => parseFloat(rsi) > 70) && 
                            previousRsi.every(rsi => parseInt(rsi) > 60) && 
                            latestRsi > parseFloat(previousRsi[previousRsi.length - 1])
        
        // console.log('Latest RSI: ', latestRsi);
        // console.log('In Position: ', inPosition, sellQty);

        if(inPosition) {
            if(sellCheck(latestRsi)) {
                let sellResponse = await client.order({
                                        type: OrderType.MARKET,
                                        symbol: btcSymbol,
                                        side: 'SELL',
                                        quoteOrderQty: sellQty.toString()
                                    });

                console.log('Sell success: ', sellResponse);
            }
        }
        else {
            if(buyCheck(latestRsi)) {
                let buyResponse = await client.order({
                    type: OrderType.MARKET,
                    symbol: btcSymbol,
                    side: 'BUY',
                    quoteOrderQty: parseFloat(usdtBalance).toString()
                });

                console.log('Buy success: ', buyResponse);
            }

            if(isStillUpTrend) {
                let buyResponse = await client.order({
                    type: OrderType.MARKET,
                    symbol: btcSymbol,
                    side: 'BUY',
                    quoteOrderQty: parseFloat(usdtBalance).toString()
                });

                console.log('Buy success: ', buyResponse);
            }
        }

        if(previousRsi.length === 10) previousRsi.shift();
        previousRsi.push(latestRsi);
        
        setTimeout(() => {
            bot()
        }, 6 * 60 * 60 * 1000);
    }
    catch(err) {
        console.log(err);
    }
};

bot();

function buyCheck(latest: any) {
    let isBuyTrggering = false;

    if(lowest === 0) {
        if(latest <= OVERSOLD) {
            lowest = latest;
        }
        else {
            lowest = 0;
        }
    }
    else {
        if(recentHigh === 0) {
            if(latest <= OVERSOLD) {
                lowest = latest;
            }
            else if(latest >= crossAboveOffset) {
                recentHigh = latest;
            }
        }
        else {
            if(higherLow === 0) {
                if(latest >= buyAfterCrossAbove) {
                    isBuyTrggering = true;

                    lowest = 0;
                    recentHigh = 0;
                    higherLow = 0;
                }

                if(latest <= OVERSOLD) {
                    lowest = latest;
                    recentHigh = 0;
                }
                else if(latest <= higherLowOffset) {
                    higherLow = latest;
                }
                else if(latest > recentHigh && latest < buyAfterCrossAbove) {
                    recentHigh = latest;
                }
            }
            else {
                if(latest < lowest) {
                    lowest = latest;
                    recentHigh = 0;
                    higherLow = 0;
                }
                else if(latest < higherLow) {
                    higherLow = latest;
                }
                else if(Math.abs(latest - recentHigh) < 0.5) {
                    isBuyTrggering = true;

                    lowest = 0;
                    recentHigh = 0;
                    higherLow = 0;
                }
            }
        }
    }

    return isBuyTrggering;
};

function sellCheck(latest: any) {
    let isSellTriggering = false;

    if(highest === 0) {
        if(latest >= OVERBOUGHT) {
            highest = latest;
        }
        else {
            highest = 0;
        }
    }
    else {
        if(recentLow === 0) {
            if(latest >= OVERBOUGHT) {
                highest = latest;
            }
            else if(latest <= crossBelowOffset) {
                recentLow = latest;
            }
        }
        else {
            if(lowerHigh === 0) {
                if(latest <= sellAfterCrossBelow) {
                    isSellTriggering = true;

                    highest = 0;
                    recentLow = 0;
                    lowerHigh = 0;
                }

                if(latest >= OVERBOUGHT) {
                    highest = latest;
                    recentLow = 0;
                }
                else if(latest >= lowerHighOffset) {
                    lowerHigh = latest;
                }
                else if(latest < recentLow && latest > sellAfterCrossBelow) {
                    recentLow = latest;
                }
            }
            else {
                if(latest >= OVERBOUGHT) {
                    highest = latest;
                    recentLow = 0;
                    lowerHigh = 0;
                }
                else if(latest > lowerHigh) {
                    lowerHigh = latest;
                }
                else if(Math.abs(latest - recentLow) < 0.5) {
                    // sell signal
                    isSellTriggering = true;

                    highest = 0;
                    recentLow = 0;
                    lowerHigh = 0;
                }
            }
        }
    }

    return isSellTriggering;
};

// async function getCandles() {
//     try {
//         let targetSymbol = 'BTCUSDT'; 
//         let btcCandles = await client.candles({ symbol: targetSymbol, interval: '12h', limit: 360 });
//         let btcCandles2 = await client.candles({ symbol: targetSymbol, interval: '1d', limit: 180 });
//         let result: any[] = [];
//         let result2: any[] = [];

//         for(let i = 0; i < btcCandles.length; i++) {
//             btcRsi.update(btcCandles[i].close);
            
//             if(i < PERIOD) {
//                 result.push({
//                     date: new Date(btcCandles[i].closeTime),
//                     price: btcCandles[i].close,
//                     rsi: '0'
//                 });
//             }

//             else {
//                 result.push({
//                     date: new Date(btcCandles[i].closeTime),
//                     price: btcCandles[i].close,
//                     rsi: btcRsi.getResult().valueOf()
//                 });

//             }
//         }

//         for(let j = 0; j < btcCandles2.length; j++) {
//             btcRsi2.update(btcCandles2[j].close);

//             if(j < PERIOD) {
//                 result2.push({
//                     date: new Date(btcCandles2[j].closeTime),
//                     price: btcCandles2[j].close,
//                     rsi: '0'
//                 });
//             }
//             else {
//                 result2.push({
//                     date: new Date(btcCandles2[j].closeTime),
//                     price: btcCandles2[j].close,
//                     rsi: btcRsi2.getResult().valueOf()
//                 });
//             }
//         }

//         fs.writeFileSync('candles.json', JSON.stringify(result, null, 4));
//         fs.writeFileSync('candles2.json', JSON.stringify(result2, null, 4));
//     }
//     catch(err) {
//         console.log(err);
//     }
// };

// getCandles();