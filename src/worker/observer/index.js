const fileSave       = require('./fileSave');
const redisClient    = require('lib/redis');
const makeRedisTable = require('lib/worker/makeRedisTable');

const observer = (redisTable) => {

  let enableSave = true;
  redisClient.getMultiTable(redisTable)
  .then(res => {
    if(enableSave) {
      enableSave = false;

      fileSave.fileUpdateCryptoObserve(res, redisTable, (error) => {
        if(error) {
          console.log(error);
          enableSave = true;
        }
        else {
          enableSave = true;
        }
      });

    }

  });
}

async function main() {
  const redisTable = await makeRedisTable.getCoinTable();
  setInterval(observer, 1000, redisTable);
}

main();















