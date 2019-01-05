const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect = (cb) => {
    MongoClient.connect('', {
            useNewUrlParser: true
        })
        .then(client => {
            _db = client.db();
            console.log('Connected to MongoDB');
            cb()
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
