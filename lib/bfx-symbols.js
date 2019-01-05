const BFX = require('bitfinex-api-node');

const bfxRest = new BFX();
const rest = bfxRest.rest(2);

/**
 * Fetch all symbols that are currently trading on BFX
 *
 * @param {String} slice Websocket must be split into 50 instruments at a time. Slice is the number of 50 multiples. i.e 1 = 0-49
 * @public
 */
const getSymbols = (slice, next) => {
    rest.symbols()
        .then(symbols => {
            instList = symbols.map(e => `t${e.toUpperCase()}`);
            next(instList.slice((slice * 49), (slice * 49) + 49));
        })
        .catch(err => {
            console.error(err);
            console.error('API limit issue.');
        });
}

exports.getSymbols = getSymbols;