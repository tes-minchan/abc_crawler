const fs = require('fs');
const marketConfig = require('config').marketConfig;

// file save env.
const fileHeader   = "time, ask, askVolume, bid, bidVolume, currency, market \n";
const saveInterval = 240;  // minutes
const savePath     = './files';

function fileSave () {

  this.startDate = new Date().getTime();

  const timestamp = new Date(this.startDate);
  this.fileName = {};

  // init file save directory.
  marketConfig.marketList.forEach(market => {
    marketConfig[market].crawl_list.forEach(coin => {
      
      if (!fs.existsSync(`${savePath}/${coin}`)){
          fs.mkdirSync(`${savePath}/${coin}`);
      }

      this.fileName[coin] = `${timestamp.toISOString()}_${coin}.csv`;
      fs.writeFile(`${savePath}/${coin}/${this.fileName[coin] }`, fileHeader, function(err) {
        if(err) throw err;
      });

    });

  });
}


fileSave.prototype.fileUpdateCryptoObserve = function(coinInfo, redis_table) {
  return new Promise((resolve)=> {
    let saveData  = {
      ask : undefined,
      askVol : undefined,
      bid : undefined,
      bidVol : undefined,
      currency : undefined,
      market : undefined
    }
  
    const currTime = new Date();
    const checkTime = (currTime - this.startDate) / 60000;
  
    let saveNewFile = false;
  
    if(checkTime > saveInterval) {
      this.startDate = new Date().getTime();
      saveNewFile = true;
    }
  
    for(const [index, item] of coinInfo.entries()) {
      if(!item) {
        saveUpdate = false;
        continue;
      }
      else {
        if(index%2 !== 0) {
          const getIndex = Object.keys(item).length - 1;
  
          saveData.bid = Object.keys(item)[getIndex];
          saveData.bidVol = Object.values(item)[getIndex];
  
          saveData.market = redis_table[index][1].split('_')[0];
          saveData.currency = redis_table[index][1].split('_')[1].replace('KRW','');
  
          const dataToFile = `${currTime.toISOString()}, ${saveData.ask}, ${saveData.askVol}, ${saveData.bid}, ${saveData.bidVol}, ${saveData.currency}, ${saveData.market}` + "\n";

          if(!saveNewFile) {
            fs.appendFile(`${savePath}/${saveData.currency}/${this.fileName[saveData.currency]}`, dataToFile, function(err) {
              if(err) throw err;
            });
          }
          else {
            const timestamp = new Date(this.startDate);
            this.fileName[saveData.currency] = `${timestamp.toISOString()}_${saveData.currency}.csv`;
  
            fs.writeFile(`${savePath}/${saveData.currency}/${this.fileName[saveData.currency] }`, fileHeader + dataToFile, function(err) {
              if(err) throw err;
            });
          }
        }
        else {
          saveData.ask    = Object.keys(item)[0];
          saveData.askVol = Object.values(item)[0];
        }
      }
    }
    resolve();
  });




}


module.exports = new fileSave();