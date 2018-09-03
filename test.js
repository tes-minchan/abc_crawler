var fs = require('fs');


fs.writeFile(`./files/btc/btc.csv`, 'test', function(err) {

console.log(err);
});

fs.exists('./test.js', function (exists) {

  console.log(exists);
});