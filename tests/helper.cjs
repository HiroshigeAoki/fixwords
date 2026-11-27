const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
exports.setup = async function () {
  const server = http.createServer((req, res) => {
    const file = req.url === '/fixwords.js' ? 'fixwords.js' : 'tests/fixtures/' + path.basename(req.url.split('?')[0]);
    fs.readFile(path.resolve(file), (err, data) => {
      res.writeHead(err ? 404 : 200, { 'Content-Type': file.endsWith('.js') ? 'application/javascript; charset=utf-8' : 'text/html; charset=utf-8' });
      res.end(err ? '' : data);
    });
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const browser = await chromium.launch({ headless: true });
    return { browser, base: 'http://127.0.0.1:' + server.address().port,
      close: async () => { await browser.close(); await new Promise(r => server.close(r)); } };
  } catch (err) { server.close(); throw err; }
};
// The title only shows while the bar is idle; with saved changes the bar offers "Keep editing" instead.
exports.start = async page => {
  const title = page.locator('#fixwords-title');
  if (await title.isVisible()) await title.click();
  else await page.locator('#fixwords-bar button').filter({ hasText: /^(Keep editing|続けて直す)$/ }).click();
};
exports.edit = async (page, selector = '#dup2', value = 'Fresh bread') => {
  await page.locator(selector).fill(value);
  await page.locator(selector).blur();
};
exports.problems = page => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/content security policy|CSP/i.test(m.text())) errors.push(m.text()); });
  return errors;
};
