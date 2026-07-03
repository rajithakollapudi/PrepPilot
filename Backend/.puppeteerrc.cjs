const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a local directory instead of the system cache
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
