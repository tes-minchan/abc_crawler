const _ = require('lodash');

const config = require('config').marketConfig;
const { bithumbCrawler, coinoneCrawler, upbitCrawler, gopaxCrawler } = require('lib/crawler');

/**
 * @description 
 *   Market which is using REST API.
 *     1. BITHUMB
 *     2. UPBIT
 */

const BithumbCrawler = new bithumbCrawler();
BithumbCrawler.getQuotes(1000);

const UpbitCrawler = new upbitCrawler();
UpbitCrawler.getQuotes();
UpbitCrawler.checkHeartBeat();

/**
 * @description 
 *   Market which is using websocket.
 *     1. COINONE
 *     2. GOPAX
 *     
 */

const CoinoneCrawler = new coinoneCrawler();
config.coinone.crawl_list.forEach(coin => {
  CoinoneCrawler.getQuotes(coin,'KRW');
});
CoinoneCrawler.checkHeartBeat();

const GopaxCrawler = new gopaxCrawler();
config.gopax.crawl_list.forEach(coin => {
  GopaxCrawler.getQuotes(coin, 1000);
});





