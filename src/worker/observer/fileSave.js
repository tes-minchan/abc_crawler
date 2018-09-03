var fs = require('fs');

const fileHeader = "time, ask, askVolume, bid, bidVolume, currency, market \n";
const saveInterval = 240;  // minutes
const savePath     = './files';

function fileSave () {

  this.startDate = new Date().getTime();

  const timestamp = new Date(this.startDate);
  this.fileName  = `${timestamp.toISOString()}_.csv`;
  fs.writeFile(`${savePath}/${this.fileName}`, fileHeader, (error) => {
    console.log(error);
  });
}


fileSave.prototype.fileUpdateCryptoObserve = function(coinInfo, redis_table, callback) {
  let saveToFile = "";
  let saveUpdate = true;
  let saveData  = {
    ask : undefined,
    askVol : undefined,
    bid : undefined,
    bidVol : undefined,
    currency : undefined,
    market : undefined
  }

  const now = new Date().toISOString();

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

        saveToFile += `${now}, "${saveData.ask}", "${saveData.askVol}", "${saveData.bid}", "${saveData.bidVol}", "${saveData.currency}", "${saveData.market}"` + "\n";
      }
      else {
        saveData.ask = Object.keys(item)[0];
        saveData.askVol = Object.values(item)[0];
      }
    }
  }

  if(saveUpdate) {
    const now = new Date().getTime();
    const checkTime = (now - this.startDate) / 60000;

    if(checkTime < saveInterval) {
      fs.appendFile(`${savePath}/${this.fileName}`, saveToFile, function (err) {
        if (err) {
          callback(err);
        }
        else {

          callback(null);
        }
      });

    }
    else {
      this.startDate  = new Date().getTime();
      const timestamp = new Date(this.startDate);
      
      this.fileName  = `${timestamp.toISOString()}_.csv`;

      fs.writeFile(`${savePath}/${this.fileName}`, fileHeader + saveToFile, function(err) {
        if (err) {
          callback(err);
        }
        else {
          callback(null);
        }
      }); 

    }

  }
  else {
    callback("skip save to file");
  }
}


module.exports = new fileSave();