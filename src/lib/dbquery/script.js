var db = require('lib/db');


module.exports = {

  dbUpdateCryptoObserve: function(coinInfo, redis_table, connection, callback) {

    let sql_query = "";
    let saveData  = {
      ask : undefined,
      askVol : undefined,
      bid : undefined,
      bidVol : undefined,
      currency : undefined,
      market : undefined
    }

    for(const [index, item] of coinInfo.entries()) {
      if(!item) {
        return;
      }
      else {
        if(index%2 !== 0) {
          const getIndex = Object.keys(item).length - 1;

          saveData.bid = Object.keys(item)[getIndex];
          saveData.bidVol = Object.values(item)[getIndex];
  
          saveData.market = redis_table[index][1].split('_')[0];
          saveData.currency = redis_table[index][1].split('_')[1].replace('KRW','');
  
          sql_query += `INSERT INTO observe_coin (curr_time, ask, ask_vol, bid, bid_vol, currency, market) VALUES (NOW(), "${saveData.ask}", "${saveData.askVol}", "${saveData.bid}", "${saveData.bidVol}", "${saveData.currency}", "${saveData.market}" );`;
        }
        else {
          saveData.ask = Object.keys(item)[0];
          saveData.askVol = Object.values(item)[0];
        }
      }
    }

    db.doMultiQuery(
      connection
      , sql_query
      , function(err, connection, results) {
          if (err) {
            console.log("[Internal][ERROR] dbUpdateCryptoObserve func");
            callback(err, connection);
          } 
          else {
            console.log("success to save DB");
            callback(null, connection);
          }
        }
    );

  },

  


}