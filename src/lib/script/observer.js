const async = require('async');

const db = require('lib/db');
const dbScript = require('lib/dbquery/script');
const marketConfig = require('config').marketConfig;

const redisClient = require('lib/redis');
const redis_table = [];


// Process exception 
process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});



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

let enableSave = true;

const observer = (connection) => {
  redisClient.getMultiTable(redis_table)
  .then(res => {   

    if(enableSave) {
      enableSave = false;
      async.waterfall([
        async.apply(db.beginTRX, connection),
        async.apply(dbScript.dbUpdateCryptoObserve, res, redis_table)
      ], (error, connection, result) => {
        if(error) {
          console.log("getMultiTable error : ", error);
          enableSave = true;
        }
        else {
          connection.commit(function (error) {
            if (error) {
              console.log("connection.commit error : ", error);
              connection.rollback();
            }
            else {
              const curr_time = new Date();
              console.log(curr_time, " success to save db");
            }
          });
          enableSave = true;
        }
      });
    }


  });
}

db.getConnection(function (error, connection) {
  setInterval(observer, 1000, connection);
});













