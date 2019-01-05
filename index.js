const price = require('./lib/price');
const db = require('./util/database');

db.mongoConnect(() => {
    for (let i = 0; i < 10; i++) {
        let soc = new price.Candles(i);
    }
});