const async = require('async');

const db = require('lib/db');
const dbScript = require('lib/dbquery/script');
const marketConfig = require('config').marketConfig;

const redisClient = require('lib/redis');
const redis_table = [];

// make redis table to get coin prices
marketConfig.bithumb.coin_list.forEach(coin => {
  redis_table.push(['hgetall',`BITHUMB_${coin}KRW_ASK`]);
  redis_table.push(['hgetall',`BITHUMB_${coin}KRW_BID`]);
});

marketConfig.coinone.coin_list.forEach(coin => {
  redis_table.push(['hgetall',`COINONE_${coin.name}KRW_ASK`]);
  redis_table.push(['hgetall',`COINONE_${coin.name}KRW_BID`]);
});

marketConfig.upbit.coin_list.forEach(coin => {
  redis_table.push(['hgetall',`UPBIT_${coin}KRW_ASK`]);
  redis_table.push(['hgetall',`UPBIT_${coin}KRW_BID`]);
});

marketConfig.gopax.coin_list.forEach(coin => {
  redis_table.push(['hgetall',`GOPAX_${coin}KRW_ASK`]);
  redis_table.push(['hgetall',`GOPAX_${coin}KRW_BID`]);
});

const observer = () => {
  redisClient.getMultiTable(redis_table)
  .then(res => {
    async.waterfall([
      db.getConnection,
      db.beginTRX,
      async.apply(dbScript.dbUpdateCryptoObserve, res, redis_table)
    ], (error, connection, result) => {
      if(error) {
        console.log("getMultiTable error : ", error);
        connection.rollback(function() {
          connection.release();
        });
      }
      else {
        connection.commit(function (error) {
          if (error) {
            console.log("connection.commit error : ", error);
            connection.rollback(function () {
              connection.release();

            });
          }
          else {
            connection.release();
          }
        });
      }
    });
  });
}

setInterval(observer, 1000);












