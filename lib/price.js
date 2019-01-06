const BFX = require("bitfinex-api-node");

const symbols = require("./bfx-symbols");
const db = require("../util/database");

/**
 * Get OHLC from BFXws
 *
 * @param {String} slice Websocket must be split into 50 instruments at a time. Slice is the number of 50 multiples. i.e 1 = 0-49
 * @public
 */
class Candles {
	constructor(slice) {
		const bfx = new BFX({
			apiKey: "...",
			apiSecret: "...",
			ws: {
				autoReconnect: true,
				seqAudit: true,
				packetWDDelay: 10 * 1000
			}
		});

		this.ws = bfx.ws(2, {
			manageCandles: true, // Enable candle dataset persistence/management
			transform: true // Converts ws data arrays to Candle models (and others)
		});
		this.slice = slice;
		this._getData();
	}

	/**
	 * Fetch candle data from BFXws
	 *
	 * @private
	 */
	_getData() {
		symbols.getSymbols(this.slice, instList => {
			console.log(
				`Slice[${this.slice}] fetching ${instList.length} instruments`
			);
			if (instList.length > 0) {
				this.ws.on("error", err => console.log(err));
				for (let i = 0; i < instList.length; i++) {
					this.ws.on("open", () => {
						this.ws.subscribeCandles(`trade:1D:${instList[i]}`);
					});
				}

				instList.forEach(ticker => {
					this.ws.onCandle({
							key: `trade:1D:${ticker}`
						},
						candles => {
							try {
								// Get previous candle and save to database
								const c = candles[1];
								console.log(ticker, new Date(c.mts), c.close);
								this._saveToDb(ticker, c)
							} catch (err) {
								console.log(err);
							}
						}
					);
				});
				this.ws.open();
			}
		});
	}

	/**
	 * Save candle data to db
	 *
	 * @param {String} ticker Ticker string to be added to database 
	 * @param {object} candle Candle data from BFX, will contain dt, OHLC and volume in some weird order
	 * @private
	 */
	_saveToDb(ticker, candle) {
		db.getDb()
			.collection("Price")
			.insertOne({
				Date_Time: new Date(candle.mts),
				Ticker: ticker,
				Open: candle.open,
				High: candle.high,
				Low: candle.low,
				Close: candle.close,
				Volume: candle.volume,
				Exchange_ID: "BFX",
				TimeFrame: "D"
			})
			.then()
			.catch(err => {});
	};
}

exports.Candles = Candles;