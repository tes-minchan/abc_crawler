const fileSave       = require('./fileSave');
const redisClient    = require('lib/redis');
const makeRedisTable = require('lib/worker/makeRedisTable');

const observer = (redisTable) => {

  let enableSave = true;
  redisClient.getMultiTable(redisTable)
  .then(async (res) => {
    if(enableSave) {
      enableSave = false;
      
      await fileSave.fileUpdateCryptoObserve(res, redisTable);  
      enableSave = true;

    }

  });
}

async function main() {
  const redisTable = await makeRedisTable.getCoinTable();
  setInterval(observer, 1000, redisTable);
}

main();















