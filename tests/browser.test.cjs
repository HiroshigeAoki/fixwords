const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const { setup, start, edit, problems } = require('./helper.cjs');
describe("browser behaviour", () => {
let env;
before(async () => {
  try { env = await setup(); } catch (err) { console.error(err.message); throw err; }
});
after(async () => { if (env) await env.close(); });
async function open(name = 'en', options = {}, init) {
  const context = await env.browser.newContext(options);
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  page.errors = problems(page);
  await page.goto(env.base + '/' + name + '.html');
  return page;
}
async function done(page) { assert.deepEqual(page.errors, []); await page.context().close(); }
test('script at the top of body waits for the whole page and a later meta tag', async () => {
  const p = await open();
  await p.route('**/top.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:
    '<html lang="en"><head></head><body><script src="/fixwords.js"></script>' +
    '<meta name="fixwords" content=\'{"lang":"ja"}\'><h1>Title</h1><p id="late">Late wording</p></body></html>'}));
  await p.goto(env.base + '/top.html');
  assert.equal(await p.locator('#fixwords-title').textContent(), '✎ 文言を直す');
  await p.locator('#fixwords-bar button').first().click();
  assert.equal(await p.locator('#late').getAttribute('contenteditable'), 'plaintext-only');
  await done(p);
});
test('self enabling, head/body placement, duplicate load and metadata defaults', async () => {
  for (const name of ['en','head']) {
    const p = await open(name);
    assert.equal(await p.locator('#fixwords-title').textContent(), '✎ Fix wording');
    await p.addScriptTag({ url: '/fixwords.js' });
    assert.equal(await p.locator('#fixwords-bar').count(), 1);
    await done(p);
  }
  for (const content of ['', 'on', '{broken']) {
    const p = await open();
    await p.route('**/defaults.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:
      '<html lang="en"><head><meta name="fixwords" content="' + content +
      '"></head><body><p>Sample wording</p><script src="/fixwords.js"></script></body></html>'}));
    await p.goto(env.base + '/defaults.html');
    assert.equal(await p.locator('#fixwords-title').textContent(), '✎ Fix wording');
    await done(p);
  }
});
test('hide tucks the bar into the pen button while editing stays on, and the pen brings it back', async () => {
  for (const lang of ['en','ja']) {
    const p = await open(lang);
    const hide = p.locator('#fixwords-hide');
    assert.equal(await hide.isVisible(), false);
    await start(p);
    assert.equal(await hide.textContent(), lang === 'en' ? 'Hide' : '隠す');
    await edit(p);
    await hide.click();
    assert.equal(await p.locator('#fixwords-bar').isVisible(), false);
    assert.equal(await p.locator('#fixwords-handle').isVisible(), true);
    assert.equal(await p.locator('#fixwords-badge').textContent(), '1');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'fixwords-handle');
    // Still editing: the text stays editable and new edits count on the badge.
    assert.equal(await p.locator('#dup2').getAttribute('contenteditable'), 'plaintext-only');
    await edit(p, '#dup1', 'Fresh rolls');
    assert.equal(await p.locator('#fixwords-badge').textContent(), '2');
    // Hiding is not closing: nothing is stored as closed, and a reload shows the bar again.
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)).closed), false);
    await p.locator('#fixwords-handle').click();
    assert.equal(await p.locator('#fixwords-bar').isVisible(), true);
    assert.equal(await p.locator('#fixwords-handle').isVisible(), false);
    assert.equal(await p.evaluate(() => document.activeElement.id), 'fixwords-hide');
    assert.match(await p.locator('#fixwords-status').textContent(), /2/);
    assert.equal(await p.locator('#dup2').getAttribute('contenteditable'), 'plaintext-only');
    // The cross keeps its meaning: it closes the bar and ends editing.
    await p.locator('#fixwords-close').click();
    assert.equal(await p.locator('#dup2').getAttribute('contenteditable'), null);
    await p.locator('#fixwords-handle').click();
    assert.equal(await p.locator('#fixwords-bar').isVisible(), true);
    assert.equal(await p.locator('#dup2').getAttribute('contenteditable'), null);
    await done(p);
  }
});
test('hide on a phone keeps the room under the text, so the page does not jump', async () => {
  const p = await open('en', { viewport: { width: 390, height: 500 } });
  await p.evaluate(() => { for (let i = 0; i < 30; i++) { const q = document.createElement('p'); q.textContent = 'Filler ' + i; document.body.appendChild(q); } });
  await start(p);
  await edit(p);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const y = await p.evaluate(() => window.scrollY);
  await p.locator('#fixwords-hide').click();
  assert.equal(await p.evaluate(() => window.scrollY), y);
  await done(p);
  // Hiding on a wide window and then turning it into a phone still leaves room.
  const q = await open('en', { viewport: { width: 700, height: 390 } });
  await start(q);
  await edit(q);
  await q.locator('#fixwords-hide').click();
  await q.setViewportSize({ width: 390, height: 500 });
  await q.waitForFunction(() => document.getElementById('fixwords-spacer'));
  assert.ok(await q.evaluate(() => document.getElementById('fixwords-spacer').offsetHeight) > 100);
  await done(q);
});
test('text beside a link is editable on its own and the link stays a link', async () => {
  const p = await open('en', {permissions:['clipboard-read','clipboard-write']});
  await p.route('**/mixed.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:
    '<html lang="en"><head><title>Mixed</title></head><body><ul><li id="mixed">Use the same form (<a id="ref" href="#form">FORM-1</a>) as before.</li></ul>' +
    '<p id="strong">Keep <strong>this</strong> line</p><p id="alone">) as before.</p><label id="lab">Name <input></label>' +
    '<script src="/fixwords.js"></script></body></html>'}));
  await p.goto(env.base + '/mixed.html');
  // An edit saved before parts existed still finds its element: parts are counted apart.
  await p.evaluate(() => localStorage.setItem('fixwords:/mixed.html', JSON.stringify({ v: 1, closed: false,
    edits: [{ o: ') as before.', i: 1, n: 1, t: ') as ever.' }] })));
  await p.reload();
  assert.equal(await p.locator('#alone').textContent(), ') as ever.');
  assert.equal(await p.locator('#mixed').textContent(), 'Use the same form (FORM-1) as before.');
  assert.equal(await p.locator('#lab fixwords-text').count(), 0);
  await start(p);
  const runs = p.locator('#mixed [data-fixwords-editable]');
  assert.deepEqual(await runs.allTextContents(), ['Use the same form (', 'FORM-1', ') as before.']);
  assert.equal(await p.locator('#strong [data-fixwords-editable]').count(), 3);
  await edit(p, '#mixed > fixwords-text >> nth=0', 'Use the 2020 form (');
  await edit(p, '#mixed > fixwords-text >> nth=1', ').');
  assert.equal(await p.locator('#mixed').textContent(), 'Use the 2020 form (FORM-1).');
  assert.equal(await p.locator('#ref').getAttribute('href'), '#form');
  await p.locator('#fixwords-send').click();
  const report = await p.evaluate(() => navigator.clipboard.readText());
  assert.match(report, /Use the same form \(/); assert.match(report, /Use the 2020 form \(/);
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:/mixed.html')).edits);
  assert.deepEqual(stored.filter(e => e.w).map(e => e.t), ['Use the 2020 form (', ').']);
  await p.reload();
  assert.equal(await p.locator('#mixed').textContent(), 'Use the 2020 form (FORM-1).');
  assert.equal(await p.locator('#alone').textContent(), ') as ever.');
  await done(p);
});
test('language selection: page, configuration and navigator', async () => {
  for (const [html, configured, locale, expected] of [
    ['ja', null, 'en-US', '文言を直す'], ['en',null,'ja-JP','Fix wording'],
    ['en','ja','en-US','文言を直す'], ['ja','en','ja-JP','Fix wording'],
    ['',null,'ja-JP','文言を直す'], ['',null,'en-GB','Fix wording'],
    ['fr','invalid','ja-JP','Fix wording']
  ]) {
    const p = await open('en', {locale});
    await p.route('**/language.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:
      '<html lang="' + html + '"><head><meta name="fixwords" content=\'' + JSON.stringify({lang:configured}) +
      '\'></head><body><p>Sample wording</p><script src="/fixwords.js"></script></body></html>'}));
    await p.goto(env.base + '/language.html');
    assert.ok((await p.locator('#fixwords-title').textContent()).includes(expected));
    await done(p);
  }
});
test('editing, both reports, persistence, folding, reset and exclusions', async () => {
  for (const lang of ['en','ja']) {
    const p = await open(lang, {permissions:['clipboard-read','clipboard-write']});
    await start(p);
    assert.equal(await p.locator('#protected').getAttribute('contenteditable'), null);
    await edit(p);
    await p.locator('#label').click();
    await p.locator('#fixwords-svg-input').fill('Wrapped');
    await p.keyboard.press('Enter');
    assert.match(await p.locator('#fixwords-status').textContent(), /2/);
    await p.locator('#fixwords-send').click();
    const report = await p.evaluate(() => navigator.clipboard.readText());
    assert.equal(report, lang === 'en'
      ? 'Bread basket — Wording changes\n\n1. Before (occurrence 2 of 2; under “Our menu”): Baked daily\n   After: Fresh bread\n\n2. (figure) Before: Packing\n   After: Wrapped'
      : 'パンのかご 文言の直し\n\n1. 元（2か所目／全2か所・見出し「今日のメニュー」の下）：毎朝焼きます\n   新：Fresh bread\n\n2. （図）元：袋詰め\n   新：Wrapped');
    assert.equal(await p.locator('#fixwords-status').textContent(), lang === 'en' ? 'Changes: 2 · Copied' : '2 か所 ・ 送る文章はコピー済みです');
    assert.equal(await p.locator('#fixwords-send').textContent(), lang === 'en' ? 'Send your changes (2)' : '直した内容を送る（2 か所）');
    const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)));
    assert.equal(stored.v, 1); assert.equal(stored.closed, false); assert.equal(typeof stored.sent, 'string');
    assert.deepEqual(stored.edits.map(e => [e.i, e.n, !!e.s, e.t]), [[2, 2, false, 'Fresh bread'], [1, 1, true, 'Wrapped']]);
    await p.reload();
    assert.equal(await p.locator('#dup2').textContent(), 'Fresh bread');
    assert.equal(await p.locator('#label').textContent(), 'Wrapped');
    await p.locator('#fixwords-bar button[aria-label]').click();
    assert.equal(await p.locator('#fixwords-bar').isVisible(), false);
    assert.equal(await p.locator('#fixwords-handle').isVisible(), true);
    await p.reload();
    assert.equal(await p.locator('#fixwords-bar').isVisible(), false);
    assert.equal(await p.locator('#fixwords-handle').isVisible(), true);
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)).closed), true);
    await p.locator('#fixwords-handle').click();
    assert.equal(await p.locator('#fixwords-bar').isVisible(), true);
    // The reset button opens the list; declining the confirm dialog of "Undo all" leaves the edits alone.
    await p.getByRole('button', {name: lang === 'en' ? 'Reset changes' : '元に戻す', exact:true}).click();
    p.once('dialog', async d => { await d.dismiss(); });
    await p.getByRole('button', {name: lang === 'en' ? 'Undo all' : 'すべて元に戻す', exact:true}).click();
    assert.equal(await p.locator('#dup2').textContent(), 'Fresh bread');
    p.once('dialog', async d => { assert.equal(d.type(), 'confirm'); assert.equal(d.message(), lang === 'en' ? 'Reset all your wording changes?' : '直した文言をすべて元に戻します。よろしいですか？'); await d.accept(); });
    await p.getByRole('button', {name: lang === 'en' ? 'Undo all' : 'すべて元に戻す', exact:true}).click();
    assert.equal(await p.locator('#dup2').textContent(), lang === 'en' ? 'Baked daily' : '毎朝焼きます');
    assert.equal(await p.locator('#label').textContent(), lang === 'en' ? 'Packing' : '袋詰め');
    await done(p);
  }
});
test('settings, manual fallback and unavailable APIs', async () => {
  const p = await open();
  await p.route('**/settings.html', async route => {
    const fs = require('node:fs');
    await route.fulfill({contentType:'text/html; charset=utf-8', body:fs.readFileSync('tests/fixtures/en.html','utf8').replace('</head>',
      '<meta name="fixwords" content=\'{"title":"Bread notes","send_to":"Send to the bakery","skip":".skip"}\'></head>')});
  });
  await p.addInitScript(() => {
    Object.defineProperty(navigator,'clipboard',{get(){ throw new Error('Unavailable'); }});
    Object.defineProperty(navigator,'share',{value:undefined});
    document.execCommand = () => false;
    Object.defineProperty(window,'localStorage',{get(){ throw new Error('Unavailable'); }});
  });
  await p.goto(env.base + '/settings.html');
  await start(p);
  assert.equal(await p.locator('.skip').getAttribute('contenteditable'), null);
  assert.match(await p.locator('#fixwords-guide').textContent(), /Send to the bakery/);
  await edit(p);
  await p.locator('#fixwords-send').click();
  assert.equal(await p.locator('#fixwords-panel textarea').inputValue().then(s => s.startsWith('Bread notes')), true);
  assert.match(await p.locator('#fixwords-note').textContent(), /Select/);
  await done(p);
});
test('phone share, cancellation, no overflow, SVG keyboard and composition', async () => {
  for (const cancel of [false,true]) {
    const p = await open('en', {hasTouch:true,isMobile:true,viewport:{width:390,height:844}}, cancel ? () => {
      navigator.share = () => Promise.reject(new DOMException('Cancelled','AbortError'));
    } : () => { navigator.share = data => { window.shared = data; return Promise.resolve(); }; });
    await start(p);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= 390), true);
    await p.locator('#label').click();
    const input = p.locator('#fixwords-svg-input');
    await input.fill('New label');
    await input.dispatchEvent('keydown',{key:'Enter',isComposing:true});
    assert.equal(await input.count(), 1);
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('#label').textContent(), 'Packing');
    await p.locator('#label').click(); await input.fill(''); await p.keyboard.press('Enter');
    assert.equal(await p.locator('#label').textContent(), 'Packing');
    await p.locator('#span2').click(); await input.fill('Packed'); await p.keyboard.press('Enter');
    assert.equal(await p.locator('#span1').textContent(), 'Ready');
    await p.locator('#fixwords-send').click();
    if (cancel) assert.match(await p.locator('#fixwords-note').textContent(), /cancelled/);
    else assert.match(await p.evaluate(() => window.shared.text), /\(figure\).*occurrence 2 of 2/);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= 390), true);
    await done(p);
  }
});

test('inline script waits for the body and preserves line breaks', async () => {
  const p = await open();
  const script = require('node:fs').readFileSync('fixwords.js', 'utf8');
  await p.route('**/inline.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:
    '<html lang="en"><head><script>' + script + '</script></head><body><p id="words">First<br>Second</p></body></html>'}));
  await p.goto(env.base + '/inline.html');
  await start(p);
  assert.equal(await p.locator('#words').getAttribute('contenteditable'), 'plaintext-only');
  // A real Enter key in a plaintext-only element inserts a newline; it must become a <br>.
  await p.locator('#words').focus();
  await p.evaluate(() => { const n = document.getElementById('words'), r = document.createRange(), s = getSelection();
    r.selectNodeContents(n); r.collapse(false); s.removeAllRanges(); s.addRange(r); });
  await p.keyboard.press('Enter'); await p.keyboard.type('Third');
  await p.locator('#words').blur();
  assert.equal(await p.locator('#words br').count(), 2);
  assert.equal(await p.locator('#words').evaluate(n => n.innerHTML), 'First<br>Second<br>Third');
  await p.locator('#fixwords-send').click({ trial: true });
  assert.match(await p.locator('#fixwords-status').textContent(), /^Changes: 1 /);
  await done(p);
});
test('async clipboard refusal falls through legacy copy to a manual sheet', async () => {
  const p = await open('en', {}, () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Refused')) } });
    document.execCommand = () => false;
  });
  await start(p); await edit(p);
  await p.locator('#fixwords-send').click();
  assert.equal(await p.locator('#fixwords-note').getAttribute('data-mode'), 'manual');
  assert.match(await p.locator('#fixwords-panel textarea').inputValue(), /After: Fresh bread/);
  await done(p);
});
test('SVG retains author attributes, edge spaces and excludes hidden definitions', async () => {
  const p = await open();
  await p.evaluate(() => {
    document.querySelector('#label').setAttribute('tabindex','-1');
    document.querySelector('#label').setAttribute('role','link');
  });
  // Reload with attributes in the source so initialization can capture them.
  const source = require('node:fs').readFileSync('tests/fixtures/en.html', 'utf8')
    .replace('id="label"', 'id="label" tabindex="-1" role="link"').replace('>Packing<', '> Packing <');
  await p.route('**/attributes.html', route => route.fulfill({contentType:'text/html; charset=utf-8',body:source}));
  await p.goto(env.base + '/attributes.html');
  await start(p);
  assert.equal(await p.locator('svg title').getAttribute('data-fixwords-editable'), null);
  assert.equal(await p.locator('svg defs text').getAttribute('data-fixwords-editable'), null);
  await p.locator('#label').focus(); await p.keyboard.press('Space');
  await p.locator('#fixwords-svg-input').fill('Packed');
  await p.keyboard.press('Enter');
  assert.equal(await p.locator('#label').textContent(), ' Packed ');
  await p.getByRole('button',{name:'Finish editing',exact:true}).click();
  assert.equal(await p.locator('#label').getAttribute('role'), 'link');
  assert.equal(await p.locator('#label').getAttribute('tabindex'), '-1');
  assert.equal(await p.locator('svg rect.fixwords-box.changed').count(), 1);
  await done(p);
});

test('SVG: blur commits, keyCode 229 does not, separate counters, box styling and print', async () => {
  const p = await open();
  const source = require('node:fs').readFileSync('tests/fixtures/en.html', 'utf8')
    .replace('<p id="lines">', '<p id="ready">Ready</p><p id="lines">');
  await p.route('**/counters.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:source}));
  await p.goto(env.base + '/counters.html');
  await start(p);
  // One dashed box per label (2 labels + 2 tspans), inserted before its text element.
  assert.equal(await p.locator('svg rect.fixwords-box').count(), 3);
  assert.equal(await p.locator('#label').evaluate(n => n.previousElementSibling.classList.contains('fixwords-box')), true);
  assert.equal(await p.locator('svg rect.fixwords-box').first().evaluate(n => getComputedStyle(n).vectorEffect), 'non-scaling-stroke');
  await p.emulateMedia({ media: 'print' });
  assert.equal(await p.locator('svg rect.fixwords-box').first().evaluate(n => getComputedStyle(n).display), 'none');
  await p.emulateMedia({ media: 'screen' });
  await p.locator('#span1').click();
  const input = p.locator('#fixwords-svg-input');
  await input.fill('Done');
  await input.dispatchEvent('keydown', { key: 'Enter', keyCode: 229 });
  assert.equal(await input.count(), 1);
  // Blur commits.
  await p.locator('#fixwords-hide').focus();
  assert.equal(await input.count(), 0);
  assert.equal(await p.locator('#span1').textContent(), 'Done');
  // HTML and SVG duplicates are counted separately: html "Ready" is 1 of 1 (no note) while the two svg ones are 1 of 2.
  await edit(p, '#ready', 'Ok');
  await p.locator('#fixwords-send').click();
  await p.locator('#fixwords-panel').waitFor();
  const report = await p.locator('#fixwords-panel textarea').inputValue();
  assert.equal(report.match(/occurrence/g).length, 1);
  assert.match(report, /\(figure\) Before \(occurrence 1 of 2; under “Our menu”\): Ready\n   After: Done/);
  assert.match(report, /1\. Before: Ready\n   After: Ok/);
  assert.equal(await p.locator('svg rect.fixwords-box.changed').count(), 1);
  await done(p);
});
test('SVG labels with a zero box or a CSS transform get no dashed box', async () => {
  const p = await open();
  const source = require('node:fs').readFileSync('tests/fixtures/en.html', 'utf8')
    .replace('<text id="label"', '<text id="moved" style="transform:translate(5px,5px)" x="10" y="90">Moved</text><text id="gone" display="none" x="10" y="100">Gone</text><text id="label"');
  await p.route('**/boxes.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:source}));
  await p.goto(env.base + '/boxes.html');
  await start(p);
  assert.equal(await p.locator('#moved').evaluate(n => n.previousElementSibling && n.previousElementSibling.classList.contains('fixwords-box')), false);
  assert.equal(await p.locator('#gone').evaluate(n => n.previousElementSibling && n.previousElementSibling.classList.contains('fixwords-box')), false);
  assert.equal(await p.locator('#label').evaluate(n => n.previousElementSibling.classList.contains('fixwords-box')), true);
  await done(p);
});
test('Escape closes the sheet, Space opens a focused label, saved SVG edit uses the s flag', async () => {
  const p = await open('en', { permissions: ['clipboard-read', 'clipboard-write'] });
  await start(p);
  await p.locator('#label').focus(); await p.keyboard.press('Space');
  await p.locator('#fixwords-svg-input').fill(' Wrapped up ');
  await p.keyboard.press('Enter');
  assert.equal(await p.locator('#label').textContent(), 'Wrapped up');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'label');
  await p.locator('#fixwords-send').click();
  await p.locator('#fixwords-panel').waitFor();
  assert.equal(await p.locator('#fixwords-panel').isVisible(), true);
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
  assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)).edits[0].s), 1);
  await done(p);
});

function seedNotes(saved) {
  return "if (!localStorage.getItem('fixwords:' + location.pathname)) localStorage.setItem('fixwords:' + location.pathname, " + JSON.stringify(JSON.stringify(saved)) + ");";
}
async function sendReport(p) {
  await p.locator('#fixwords-send').click();
  await p.locator('#fixwords-panel').waitFor();
  return p.locator('#fixwords-panel textarea').inputValue();
}
test('comments: saved notes load, appear after the edits in both languages, and round-trip', async () => {
  for (const lang of ['en', 'ja']) {
    const en = lang === 'en';
    const saved = { v: 1, closed: false,
      edits: [{ o: en ? 'Baked daily' : '毎朝焼きます', i: 1, n: 2, t: 'Fresh bread' }],
      notes: [
        { o: en ? 'Baked daily' : '毎朝焼きます', i: 2, n: 2, c: en ? 'Same on holidays?\nAnd Sundays?' : '祝日も同じですか？\n日曜も？' },
        { o: en ? 'Packing' : '袋詰め', i: 1, n: 1, s: 1, c: en ? 'Why bags?' : '袋なのはなぜ？' },
        { o: 'Gone', i: 1, n: 1, c: 'Dropped' },
        { c: en ? 'Shorter overall' : '全体に短く' }] };
    const p = await open(lang, { permissions: ['clipboard-read', 'clipboard-write'] }, seedNotes(saved));
    assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
    assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-noted'), null);
    assert.equal(await p.locator('#label').getAttribute('data-fixwords-noted'), '');
    assert.equal(await p.locator('#fixwords-bar').getAttribute('data-idle'), null);
    assert.equal(await p.locator('#fixwords-status').textContent(), en ? 'Changes: 1, comments: 3 · Not sent yet' : '直し 1 か所・コメント 3 件 ・ まだ送っていません');
    const report = await sendReport(p);
    assert.equal(report, en
      ? 'Bread basket — Wording changes\n\n1. Before (occurrence 1 of 2; under “Our menu”): Baked daily\n   After: Fresh bread\n\n2. Comment on: Baked daily (occurrence 2 of 2; under “Our menu”)\n   Note: Same on holidays? / And Sundays?\n\n3. (figure) Comment on: Packing\n   Note: Why bags?\n\n4. Comment (whole page)\n   Note: Shorter overall'
      : 'パンのかご 文言の直し\n\n1. 元（1か所目／全2か所・見出し「今日のメニュー」の下）：毎朝焼きます\n   新：Fresh bread\n\n2. コメント（対象：毎朝焼きます）（2か所目／全2か所・見出し「今日のメニュー」の下）\n   内容：祝日も同じですか？ ／ 日曜も？\n\n3. （図）コメント（対象：袋詰め）\n   内容：袋なのはなぜ？\n\n4. コメント（ページ全体）\n   内容：全体に短く');
    assert.equal(await p.locator('#fixwords-status').textContent(), en ? 'Changes: 1, comments: 3 · Copied' : '直し 1 か所・コメント 3 件 ・ 送る文章はコピー済みです');
    assert.equal(await p.locator('#fixwords-send').textContent(), en ? 'Send your changes (1 + 3 comments)' : '直した内容を送る（直し 1 か所・コメント 3 件）');
    await p.reload();
    const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)));
    assert.equal(stored.v, 1);
    assert.equal(stored.notes.length, 3);
    assert.deepEqual(stored.notes.map(x => [x.o === undefined, x.i, x.n, !!x.s]), [[false, 2, 2, false], [false, 1, 1, true], [true, undefined, undefined, false]]);
    assert.equal(stored.notes[2].c, en ? 'Shorter overall' : '全体に短く');
    await done(p);
  }
});
test('comments: only-notes report, genre line, and unchanged output without notes or genre', async () => {
  const p = await open('en', { permissions: ['clipboard-read', 'clipboard-write'] }, seedNotes({ v: 1, closed: false, edits: [], notes: [{ c: 'Just a thought' }] }));
  await p.route('**/genre.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body:
    require('node:fs').readFileSync('tests/fixtures/en.html', 'utf8').replace('</head>', '<meta name="fixwords" content=\'{"genre":"  Product page "}\'></head>') }));
  await p.goto(env.base + '/genre.html');
  const report = await sendReport(p);
  assert.equal(report, 'Bread basket — Wording changes\nType: Product page\n\n1. Comment (whole page)\n   Note: Just a thought');
  await done(p);
  const q = await open('ja', {}, seedNotes({ v: 1, closed: false, edits: [], notes: [{ c: 'x' }] }));
  await q.route('**/genre.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body:
    require('node:fs').readFileSync('tests/fixtures/ja.html', 'utf8').replace('</head>', '<meta name="fixwords" content=\'{"genre":"説明資料"}\'></head>') }));
  await q.goto(env.base + '/genre.html');
  assert.match(await sendReport(q), /^パンのかご 文言の直し\n種類：説明資料\n\n1\. コメント（ページ全体）\n   内容：x$/);
  await done(q);
  const r = await open('en', {}, seedNotes({ v: 1, closed: false, edits: [{ o: 'Packing', i: 1, n: 1, s: 1, t: 'Wrapped' }] }));
  assert.equal(await sendReport(r), 'Bread basket — Wording changes\n\n1. (figure) Before: Packing\n   After: Wrapped');
  await done(r);
});

async function openComment(p, selector) {
  await p.locator(selector).click();
  await p.locator('#fixwords-tools button').first().click();
}
async function note(p, selector, value, key = 'Control+Enter') {
  await openComment(p, selector);
  await p.locator('#fixwords-note-input').fill(value);
  if (key) await p.keyboard.press(key);
}
test('comments: toolbar, open/save/cancel/delete/blur and Enter behaviour on HTML text', async () => {
  const p = await open('en');
  await start(p);
  assert.equal(await p.locator('#dup1').getAttribute('contenteditable'), 'plaintext-only');
  assert.equal(await p.locator('#fixwords-pagenote').isVisible(), true);
  await openComment(p, '#dup1');
  const input = p.locator('#fixwords-note-input');
  assert.equal(await input.getAttribute('aria-label'), 'Write a comment');
  assert.equal(await input.inputValue(), '');
  await input.fill('Same on holidays?');
  await p.keyboard.press('Control+Enter');
  assert.equal(await input.count(), 0);
  assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-noted'), '');
  assert.equal(await p.locator('#fixwords-status').textContent(), 'Changes: 0, comments: 1 · Not sent yet');
  assert.equal(await p.locator('#fixwords-send').getAttribute('aria-disabled'), 'false');
  // Prefilled; Escape cancels.
  await openComment(p, '#dup1');
  assert.equal(await input.inputValue(), 'Same on holidays?');
  await input.fill('Changed my mind'); await p.keyboard.press('Escape');
  assert.equal(await input.count(), 0);
  await openComment(p, '#dup1');
  assert.equal(await input.inputValue(), 'Same on holidays?');
  // Plain Enter is a newline; composition Ctrl+Enter does not save.
  await p.keyboard.press('Control+End'); await p.keyboard.press('Enter'); await p.keyboard.type('And Sundays?');
  assert.equal(await input.count(), 1);
  await input.dispatchEvent('keydown', { key: 'Enter', ctrlKey: true, isComposing: true });
  assert.equal(await input.count(), 1);
  await p.keyboard.press('Meta+Enter');
  assert.equal(await input.count(), 0);
  assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)))).notes[0].c, 'Same on holidays?\nAnd Sundays?');
  // Blur saves, whitespace deletes.
  await openComment(p, '#dup2'); await input.fill('  second  ');
  await p.locator('#fixwords-hide').focus();
  assert.equal(await input.count(), 0);
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
  await note(p, '#dup1', '   ');
  assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-noted'), null);
  assert.equal(await p.locator('#fixwords-status').textContent(), 'Changes: 0, comments: 1 · Not sent yet');
  // Back to edit mode restores contenteditable; the marker stays after editing ends.
  assert.equal(await p.locator('#dup1').getAttribute('contenteditable'), 'plaintext-only');
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
  await p.getByRole('button', { name: 'Finish editing', exact: true }).click();
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
  assert.equal(await p.locator('#dup2').evaluate(n => getComputedStyle(n).textDecorationStyle), 'dotted');
  await done(p);
});
test('comments: SVG labels, page note, report, reset and counts in Japanese', async () => {
  const p = await open('ja', { permissions: ['clipboard-read', 'clipboard-write'] });
  await start(p);
  assert.equal(await p.locator('#fixwords-pagenote').textContent(), 'ページ全体へのコメント');
  await openComment(p, '#label');
  assert.equal(await p.locator('#fixwords-svg-input').count(), 0);
  await p.locator('#fixwords-note-input').fill('袋なのはなぜ？'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'label');
  await openComment(p, '#span2');
  await p.locator('#fixwords-note-input').fill('二つ目'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.locator('svg rect.fixwords-box.noted').count(), 2);
  await p.locator('#fixwords-pagenote').click();
  assert.equal(await p.locator('#fixwords-note-input').inputValue(), '');
  await p.locator('#fixwords-note-input').fill('全体に短く'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.locator('#fixwords-status').textContent(), '直し 0 か所・コメント 3 件 ・ まだ送っていません');
  await p.getByRole('button', { name: '直すのを終える', exact: true }).click();
  assert.equal(await p.locator('svg rect.fixwords-box.noted').count(), 2);
  assert.equal(await p.locator('#fixwords-bar').getAttribute('data-idle'), null);
  assert.equal(await sendReport(p), 'パンのかご 文言の直し\n\n1. （図）コメント（対象：袋詰め）\n   内容：袋なのはなぜ？\n\n2. （図）コメント（対象：できあがり）（2か所目／全2か所・見出し「今日のメニュー」の下）\n   内容：二つ目\n\n3. コメント（ページ全体）\n   内容：全体に短く');
  assert.equal(await p.locator('#fixwords-status').textContent(), '直し 0 か所・コメント 3 件 ・ 送る文章はコピー済みです');
  await p.keyboard.press('Escape');
  await p.getByRole('button', { name: '元に戻す', exact: true }).click();
  p.once('dialog', async d => { await d.accept(); });
  await p.getByRole('button', { name: 'すべて元に戻す', exact: true }).click();
  assert.equal(await p.locator('#label').getAttribute('data-fixwords-noted'), null);
  assert.equal(await p.locator('svg rect.fixwords-box.noted').count(), 0);
  assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)).notes), undefined);
  await done(p);
});
test('comments: the field never hides under the bar on a phone, and keyboard users can comment on text', async () => {
  const p = await open('en', { viewport: { width: 390, height: 640 }, hasTouch: true });
  await p.route('**/tall.html', route => route.fulfill({contentType:'text/html; charset=utf-8', body:
    '<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">' +
    '<p id="own" tabindex="-1" role="note">Own stop</p>' +
    '<p id="near" style="margin:500px 16px 0">Near the bottom</p><p style="height:400px">Filler</p>' +
    '<script src="/fixwords.js"></script></body></html>'}));
  await p.goto(env.base + '/tall.html');
  await start(p);
  const clear = async () => {
    const box = await p.locator('#fixwords-note-input').boundingBox();
    const bar = await p.locator('#fixwords-bar').boundingBox();
    assert.ok(box.y + box.height <= bar.y, 'field bottom ' + (box.y + box.height) + ' is under the bar top ' + bar.y);
    assert.ok(box.y >= 0);
  };
  await p.locator('#fixwords-pagenote').click();
  await clear();
  await p.keyboard.press('Escape');
  await openComment(p, '#near');
  await clear();
  await p.keyboard.press('Escape');
  await p.locator('#near').focus(); await p.keyboard.press('Tab');
  assert.equal(await p.evaluate(() => document.activeElement.parentNode.id), 'fixwords-tools');
  await p.keyboard.press('Shift+Tab');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'near');
  await p.keyboard.press('Tab'); await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'near');
  await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
  assert.equal(await p.locator('#fixwords-note-input').count(), 1);
  await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'near');
  assert.equal(await p.locator('#own').getAttribute('tabindex'), '-1');
  assert.equal(await p.locator('#own').getAttribute('role'), 'note');
  await done(p);
});
test('comments: phone width, textarea stays in view, noted text survives an edit of the same element', async () => {
  const p = await open('en', { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  await start(p);
  await openComment(p, '#dup1');
  const box = await p.locator('#fixwords-note-input').boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 390);
  assert.ok(box.height >= 44);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  await p.keyboard.type('Hi'); await p.keyboard.press('Control+Enter');
  await edit(p, '#dup1', 'Fresh bread');
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)));
  assert.deepEqual([stored.edits.length, stored.notes[0].o, stored.notes[0].c], [1, 'Baked daily', 'Hi']);
  await p.reload();
  assert.equal(await p.locator('#dup1').textContent(), 'Fresh bread');
  assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-noted'), '');
  await done(p);
});
const pins = p => p.locator('.fixwords-note-pin');
for (const lang of ['en', 'ja']) {
  test('comments: a 💬 pin after the commented text opens its note outside comment mode (' + lang + ')', async () => {
    const p = await open(lang);
    await start(p);
    assert.equal(await pins(p).count(), 0);
    await note(p, '#dup1', 'Same on holidays?');
    await note(p, '#label', 'Why a bag?');
    assert.equal(await pins(p).count(), 2);
    // Just after the last character of the text, on the same line.
    const pin = pins(p).first();
    const range = await p.locator('#dup1').evaluate(n => { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return { right: b.right, top: b.top, bottom: b.bottom }; });
    const box = await pin.boundingBox();
    assert.ok(box.x >= range.right && box.x <= range.right + 12, 'pin x ' + box.x + ' vs text end ' + range.right);
    assert.ok(box.y < range.bottom && box.y + box.height > range.top);
    assert.equal(await pin.textContent(), '💬');
    assert.equal(await pin.getAttribute('aria-label'), lang === 'en' ? 'Open comment: Baked daily' : 'コメントを開く：毎朝焼きます');
    // SVG label: right of its box.
    const label = await p.locator('#label').boundingBox();
    const svgPin = await pins(p).nth(1).boundingBox();
    assert.ok(svgPin.x >= label.x + label.width);
    // Out of comment mode and out of editing, the pin still opens the note.
    await p.getByRole('button', { name: lang === 'en' ? 'Finish editing' : '直すのを終える', exact: true }).click();
    assert.equal(await p.locator('#dup1').getAttribute('contenteditable'), null);
    await pin.click();
    const input = p.locator('#fixwords-note-input');
    assert.equal(await input.inputValue(), 'Same on holidays?');
    await input.fill('Also on Sundays?'); await p.keyboard.press('Control+Enter');
    assert.equal(await p.evaluate(() => document.activeElement.className), 'fixwords-note-pin');
    assert.equal((await stored(p)).notes.find(n => n.c.startsWith('Also')).c, 'Also on Sundays?');
    // Emptying the note removes its pin.
    await pin.click(); await input.fill(' '); await p.keyboard.press('Control+Enter');
    assert.equal(await pins(p).count(), 1);
    // Tucked: still shown. Closed and print: gone.
    await p.locator('#fixwords-hide').click();
    assert.equal(await pins(p).first().isVisible(), true);
    await p.emulateMedia({ media: 'print' });
    assert.equal(await pins(p).first().isVisible(), false);
    await p.emulateMedia({ media: 'screen' });
    // A reload brings saved notes back with their pin.
    await p.reload();
    assert.equal(await pins(p).count(), 1);
    await p.locator('#fixwords-close').click();
    assert.equal(await pins(p).count(), 0);
    await done(p);
  });
}
test('comments: the pin follows an edit and a resize, and stays inside a phone viewport', async () => {
  const p = await open('en', { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  await start(p);
  await note(p, '#dup1', 'Hi');
  const before = await pins(p).boundingBox();
  await edit(p, '#dup1', 'Baked daily in the oven by the window next to the door of the shop');
  const after = await pins(p).boundingBox();
  assert.ok(after.y > before.y, 'pin moved to the last line');
  assert.ok(after.x + after.width <= 390);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  await p.setViewportSize({ width: 800, height: 844 });
  // The resize event arrives after setViewportSize returns.
  await p.waitForFunction(() => {
    const r = document.createRange(); r.selectNodeContents(document.getElementById('dup1'));
    const rs = r.getClientRects(), pin = document.querySelector('.fixwords-note-pin').getBoundingClientRect();
    return Math.abs(pin.left - rs[rs.length - 1].right) < 12;
  }, null, { timeout: 2000 });
  await done(p);
});
for (const lang of ['en', 'ja']) {
  test('toolbar: focus, layout, header and keyboard (' + lang + ')', async () => {
    for (const width of [390, 1280]) for (const colorScheme of ['light', 'dark']) {
      const p = await open(lang, { viewport: { width, height: 844 }, colorScheme });
      const tools = p.locator('#fixwords-tools');
      assert.equal(await tools.isVisible(), false);
      assert.equal(await p.locator('#fixwords-title').textContent(), lang === 'en' ? '✎ Fix wording' : '✎ 文言を直す');
      await start(p);
      assert.equal(await p.locator('#fixwords-title').isVisible(), false);
      assert.equal(await p.locator('#fixwords-header #fixwords-status').textContent(), lang === 'en' ? 'No changes yet' : 'まだ直した箇所はありません');
      assert.equal(await p.locator('#fixwords-mode, #fixwords-comment').count(), 0);
      await p.locator('#dup1').focus();
      assert.equal(await tools.isVisible(), true);
      assert.equal(await tools.getAttribute('role'), 'toolbar');
      assert.ok(await tools.getAttribute('aria-label'));
      const box = await tools.boundingBox(), item = await p.locator('#dup1').boundingBox(), bar = await p.locator('#fixwords-bar').boundingBox();
      assert.ok(box.x >= 8 && box.x + box.width <= width - 8);
      assert.ok(box.y >= 8 && box.y + box.height <= item.y);
      assert.ok(box.y + box.height <= bar.y);
      await p.keyboard.press('Tab');
      assert.equal(await p.evaluate(() => document.activeElement.parentNode.id), 'fixwords-tools');
      await p.keyboard.press('Tab');
      assert.equal(await p.evaluate(() => document.activeElement.id), 'fixwords-delete');
      await p.keyboard.press('Tab');
      assert.equal(await p.evaluate(() => document.activeElement.id), 'dup2');
      await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
      await p.locator('#fixwords-note-input').dispatchEvent('keydown', {key:'Escape', isComposing:true, bubbles:true});
      assert.equal(await p.locator('#fixwords-note-input').count(), 1);
      await p.keyboard.press('Escape');
      assert.equal(await p.evaluate(() => document.activeElement.id), 'dup2');
      await p.locator('#fixwords-hide').focus();
      assert.equal(await tools.isVisible(), false);
      await done(p);
    }
  });
}

test('toolbar: label follows the note, SVG label shows it beside the input, ends with editing and with the sheet', async () => {
  const p = await open('en');
  const tools = p.locator('#fixwords-tools');
  await p.locator('#dup1').focus();
  assert.equal(await tools.isVisible(), false);
  await start(p);
  await p.locator('#dup1').focus();
  assert.equal(await tools.locator('button').first().textContent(), '💬 Comment');
  await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
  await p.locator('#fixwords-note-input').fill('Why?'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'dup1');
  assert.equal(await tools.locator('button').first().textContent(), '💬 Edit comment');
  // The label field gets the toolbar with the comment button only, above the input.
  await p.locator('#label').click();
  const input = await p.locator('#fixwords-svg-input').boundingBox(), box = await tools.boundingBox();
  assert.equal(await tools.locator('button:visible').count(), 1);
  assert.ok(box.y + box.height <= input.y + 1);
  await p.keyboard.press('Escape');
  assert.equal(await tools.isVisible(), false);
  // Editing ends: the toolbar goes.
  await p.locator('#dup2').focus();
  assert.equal(await tools.isVisible(), true);
  await p.getByRole('button', { name: 'Finish editing', exact: true }).click();
  assert.equal(await tools.isVisible(), false);
  await done(p);
});

// Revert one edit from a list.
const resetBtn = p => p.locator('#fixwords-reset');
const rowsOf = p => p.locator('#fixwords-panel .fixwords-row');
const activeId = p => p.evaluate(() => document.activeElement.id);
async function openList(p) { await resetBtn(p).click(); await p.locator('#fixwords-list-title').waitFor(); }
async function stored(p) { return p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname))); }
const L = {
  en: { title: 'Which change do you want to undo?', close: 'Close', none: 'No changes yet', all: 'Undo all', restore: 'Restore', row: 'Undo',
    unsent: 'Changes: 2 · Not sent yet', orig: 'Baked daily', first: 'First line\nSecond line' },
  ja: { title: 'どれを元に戻しますか', close: '閉じる', none: '直した箇所はありません', all: 'すべて元に戻す', restore: '取り消す', row: '元に戻す',
    unsent: '2 か所を直しました ・ まだ送っていません', orig: '毎朝焼きます', first: '一行目\n二行目' }
};
for (const [name, viewport, extra] of [['desktop', { width: 1280, height: 800 }, {}], ['phone', { width: 390, height: 844 }, { hasTouch: true, isMobile: true }]]) {
  test('revert one: list opens without changes, rows, revert second of three, undo, close (' + name + ')', async () => {
    for (const lang of ['en', 'ja']) {
      const l = L[lang];
      const p = await open(lang, { viewport, ...extra, permissions: ['clipboard-read', 'clipboard-write'] });
      await start(p);
      await edit(p, '#dup1', 'One'); await edit(p, '#dup2', 'Two'); await edit(p, '#lines', 'Three');
      const before = await stored(p);
      await openList(p);
      assert.deepEqual(await stored(p), before);
      assert.equal(await p.locator('#dup2').textContent(), 'Two');
      assert.equal(await p.locator('#fixwords-list-title').textContent(), l.title);
      assert.equal(await activeId(p), 'fixwords-list-title');
      assert.equal(await p.locator('#fixwords-panel').getAttribute('aria-label'), lang === 'en' ? 'Choose a change to undo' : '元に戻す箇所を選ぶ');
      assert.equal(await rowsOf(p).count(), 3);
      const row = rowsOf(p).nth(1);
      assert.equal(await row.locator('del').textContent(), l.orig);
      assert.equal(await row.locator('.fixwords-location').textContent(), lang === 'en' ? 'Under “Our menu”; occurrence 2 of 2' : '見出し「今日のメニュー」の下・2か所目／全2か所');
      const rb = await row.locator('button').boundingBox();
      assert.ok(rb.width >= 44 && rb.height >= 44);
      assert.equal(await row.locator('button').textContent(), l.row);
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await row.locator('button').click();
      assert.equal(await p.locator('#dup2').textContent(), l.orig);
      assert.equal(await p.locator('#dup1').textContent(), 'One');
      assert.equal(await p.locator('#lines').textContent(), 'Three');
      assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-changed'), '');
      assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-changed'), null);
      assert.deepEqual((await stored(p)).edits.map(e => e.t), ['One', 'Three']);
      assert.equal(await rowsOf(p).count(), 2);
      assert.equal(await p.locator('#fixwords-notice').isVisible(), true);
      assert.match(await p.locator('#fixwords-notice').textContent(), lang === 'en' ? /Under “Our menu”; occurrence 2 of 2 was undone/ : /見出し「今日のメニュー」の下・2か所目／全2か所を元に戻しました/);
      assert.equal(await activeId(p), '');
      assert.equal(await p.evaluate(() => document.activeElement.closest('.fixwords-row') !== null), true);
      // Restore brings it back.
      await p.getByRole('button', { name: l.restore, exact: true }).click();
      assert.equal(await p.locator('#dup2').textContent(), 'Two');
      assert.equal(await p.locator('#fixwords-notice').isVisible(), false);
      assert.deepEqual((await stored(p)).edits.map(e => e.t), ['One', 'Two', 'Three']);
      // Revert again, report and status after closing.
      await rowsOf(p).nth(1).locator('button').click();
      assert.equal(await p.locator('#fixwords-notice').isVisible(), true);
      await p.locator('#fixwords-panel button[aria-label]').first().click();
      assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
      assert.equal(await activeId(p), 'fixwords-reset');
      assert.equal(await p.locator('#fixwords-status').textContent(), l.unsent);
      assert.equal(await sendReport(p), lang === 'en'
        ? 'Bread basket — Wording changes\n\n1. Before (occurrence 1 of 2; under “Our menu”): Baked daily\n   After: One\n\n2. Before: First line / Second line\n   After: Three'
        : 'パンのかご 文言の直し\n\n1. 元（1か所目／全2か所・見出し「今日のメニュー」の下）：毎朝焼きます\n   新：One\n\n2. 元：一行目 ／ 二行目\n   新：Three');
      await p.keyboard.press('Escape');
      // Reopening shows no notice.
      await openList(p);
      assert.equal(await p.locator('#fixwords-notice').isVisible(), false);
      await done(p);
    }
  });
}
test('revert one: the 取り消す notice goes away on close and the list closes with Escape and the cross', async () => {
  const p = await open('ja');
  await start(p);
  await edit(p, '#dup1', 'One'); await edit(p, '#dup2', 'Two');
  await openList(p);
  await rowsOf(p).nth(0).locator('button').click();
  assert.equal(await p.locator('#fixwords-notice').isVisible(), true);
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
  assert.equal(await activeId(p), 'fixwords-reset');
  await openList(p);
  assert.equal(await p.locator('#fixwords-notice').isVisible(), false);
  await p.locator('#fixwords-panel button[aria-label="閉じる"]').first().click();
  assert.equal(await activeId(p), 'fixwords-reset');
  await done(p);
});
test('revert one: reverting the last text hides the title, shows Close instead of an empty line, and Restore brings the title back', async () => {
  for (const lang of ['en', 'ja']) {
    const l = L[lang];
    const p = await open(lang);
    await start(p);
    await edit(p, '#dup1', 'One');
    await openList(p);
    await rowsOf(p).nth(0).locator('button').click();
    const panel = await p.locator('#fixwords-panel').innerText();
    assert.equal(await p.locator('#fixwords-list-title').isVisible(), false);
    assert.equal(panel.includes(l.title), false);
    assert.equal(panel.includes(l.none), false);
    assert.equal(await p.locator('#fixwords-notice').isVisible(), true);
    assert.equal(await p.locator('#fixwords-reset-all').isVisible(), false);
    const done_ = p.locator('#fixwords-list-done');
    assert.equal(await done_.isVisible(), true);
    assert.equal(await done_.textContent(), l.close);
    const db = await done_.boundingBox(), pb = await p.locator('#fixwords-panel').boundingBox();
    assert.ok(db.height >= 44 && db.width > pb.width * 0.8);
    assert.equal(await activeId(p), 'fixwords-undo');
    // The cross stays at the right edge of the header without the title beside it.
    const xb = await p.locator('#fixwords-panel button[aria-label]').filter({ visible: true }).first().boundingBox();
    assert.ok(xb.x + xb.width > pb.x + pb.width - 40);
    // The notice reads as a status line, not as another boxed row.
    assert.equal(await p.locator('#fixwords-notice').evaluate(n => getComputedStyle(n).backgroundColor), 'rgba(0, 0, 0, 0)');
    await p.getByRole('button', { name: l.restore, exact: true }).click();
    assert.equal(await p.locator('#fixwords-list-title').isVisible(), true);
    assert.equal(await p.locator('#fixwords-list-title').textContent(), l.title);
    assert.equal(await done_.isVisible(), false);
    assert.equal(await rowsOf(p).count(), 1);
    await rowsOf(p).nth(0).locator('button').click();
    await done_.click();
    assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
    // The title is hidden while the bar is open, so focus lands on the visible button that ends editing.
    assert.equal(await p.evaluate(() => document.activeElement.textContent), lang === 'en' ? 'Finish editing' : '直すのを終える');
    await done(p);
  }
});
test('revert one: handed-off status returns after Restore; a row revert makes it unsent', async () => {
  const p = await open('en', { permissions: ['clipboard-read', 'clipboard-write'] });
  await start(p);
  await edit(p, '#dup1', 'One'); await edit(p, '#dup2', 'Two');
  await sendReport(p);
  assert.equal(await p.locator('#fixwords-status').textContent(), 'Changes: 2 · Copied');
  await p.keyboard.press('Escape');
  await openList(p);
  await rowsOf(p).nth(1).locator('button').click();
  assert.equal((await stored(p)).sent.length > 0, true);
  await p.getByRole('button', { name: 'Restore', exact: true }).click();
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#fixwords-status').textContent(), 'Changes: 2 · Copied');
  await openList(p);
  await rowsOf(p).nth(1).locator('button').click();
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#fixwords-status').textContent(), 'Changes: 1 · Not sent yet');
  await done(p);
});
test('revert one: double click reverts only one row, Undo all confirm accept and cancel, sent cleared', async () => {
  const p = await open('en', { permissions: ['clipboard-read', 'clipboard-write'] });
  await start(p);
  await edit(p, '#dup1', 'One'); await edit(p, '#dup2', 'Two');
  await sendReport(p); await p.keyboard.press('Escape');
  await openList(p);
  await p.evaluate(() => { const b = document.querySelector('.fixwords-row button'); b.click(); document.querySelector('.fixwords-row button').click(); });
  assert.equal(await rowsOf(p).count(), 1);
  assert.equal(await p.locator('#dup2').textContent(), 'Two');
  p.once('dialog', async d => { assert.equal(d.message(), 'Reset all your wording changes?'); await d.dismiss(); });
  await p.locator('#fixwords-reset-all').click();
  assert.equal(await p.locator('#dup2').textContent(), 'Two');
  assert.equal(await p.locator('#fixwords-panel').isVisible(), true);
  p.once('dialog', async d => { await d.accept(); });
  await p.locator('#fixwords-reset-all').click();
  assert.equal(await p.locator('#dup2').textContent(), 'Baked daily');
  assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
  assert.equal((await stored(p)).sent, undefined);
  await done(p);
});
test('revert one: SVG label rows (also with the label input open), tspan neighbours and HTML edge spaces are kept', async () => {
  const p = await open('en');
  await p.route('**/edge.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body:
    '<html lang="en"><head><title>T</title></head><body><h1>T</h1><p>a<span id="s"> Hello </span>b</p>' +
    '<svg viewBox="0 0 200 60" width="200"><text x="5" y="20"><tspan id="t1"> Left </tspan><tspan id="t2">Right</tspan></text></svg>' +
    '<script src="/fixwords.js"></script></body></html>' }));
  await p.goto(env.base + '/edge.html');
  await p.evaluate(() => localStorage.setItem('fixwords:/edge.html', JSON.stringify({ v: 1, closed: false, edits: [{ o: 'Hello', i: 1, n: 1, t: 'Hi' }] })));
  await p.reload();
  assert.equal(await p.locator('#s').evaluate(n => n.textContent), ' Hi ');
  await start(p);
  await p.locator('#t1').click();
  await p.locator('#fixwords-svg-input').fill('Changed'); await p.keyboard.press('Enter');
  assert.equal(await p.locator('#t1').evaluate(n => n.textContent), ' Changed ');
  await p.locator('#t1').click();
  await p.locator('#fixwords-svg-input').fill('Typing');
  await resetBtn(p).click();
  await p.locator('#fixwords-list-title').waitFor();
  assert.equal(await p.locator('#fixwords-svg-input').count(), 0);
  assert.equal(await rowsOf(p).count(), 2);
  assert.equal(await rowsOf(p).nth(1).locator('.fixwords-location').textContent(), 'Figure text; Under “T”');
  await rowsOf(p).nth(1).locator('button').click();
  assert.equal(await p.locator('#t1').evaluate(n => n.textContent), ' Left ');
  assert.equal(await p.locator('#t2').textContent(), 'Right');
  await p.waitForTimeout(550);
  await rowsOf(p).nth(0).locator('button').click();
  assert.equal(await p.locator('#s').evaluate(n => n.textContent), ' Hello ');
  await p.getByRole('button', { name: 'Restore', exact: true }).click();
  assert.equal(await p.locator('#s').evaluate(n => n.textContent), ' Hi ');
  p.once('dialog', async d => { await d.accept(); });
  await p.locator('#fixwords-reset-all').click();
  assert.equal(await p.locator('#s').evaluate(n => n.textContent), ' Hello ');
  await p.reload();
  assert.equal(await p.locator('#s').evaluate(n => n.textContent), ' Hello ');
  await done(p);
});
test('revert one with comments: rows list edits only, notes stay on row revert, Undo all deletes notes, notes-only list', async () => {
  const p = await open('en');
  await start(p);
  await edit(p, '#dup1', 'One');
  await openComment(p, '#dup2');
  await p.locator('#fixwords-note-input').fill('Why?'); await p.keyboard.press('Control+Enter');
  await openList(p);
  assert.equal(await rowsOf(p).count(), 1);
  await rowsOf(p).nth(0).locator('button').click();
  assert.equal(await p.locator('#dup1').textContent(), 'Baked daily');
  assert.equal((await stored(p)).notes.length, 1);
  assert.equal(await p.locator('#fixwords-reset-all').isVisible(), true);
  // Comments remain, so Undo all stays beside Close; the question title is gone with the rows.
  assert.equal(await p.locator('#fixwords-list-title').isVisible(), false);
  assert.equal(await p.locator('#fixwords-list-done').isVisible(), true);
  p.once('dialog', async d => { await d.accept(); });
  await p.locator('#fixwords-reset-all').click();
  assert.equal((await stored(p)).notes, undefined);
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), null);
  assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
  await done(p);
});
test('revert one: a list opened with comments only has no title and focuses Close', async () => {
  const p = await open('en');
  await start(p);
  await openComment(p, '#dup2');
  await p.locator('#fixwords-note-input').fill('Why?'); await p.keyboard.press('Control+Enter');
  await resetBtn(p).click(); await p.locator('#fixwords-list-done').waitFor();
  assert.equal(await rowsOf(p).count(), 0);
  assert.equal(await p.locator('#fixwords-list-title').isVisible(), false);
  assert.equal(await p.locator('#fixwords-reset-all').isVisible(), true);
  assert.equal(await activeId(p), 'fixwords-list-done');
  await done(p);
});
test('revert one: opening a comment or label closes the list, bar button hidden when nothing to undo', async () => {
  const p = await open('en');
  await start(p);
  assert.equal(await resetBtn(p).isVisible(), false);
  await edit(p, '#dup1', 'One');
  await openList(p);
  await p.locator('#label').click();
  assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
  assert.equal(await p.locator('#fixwords-svg-input').count(), 1);
  await p.keyboard.press('Escape');
  await done(p);
});

// Verdict marks: a page opts in with {"marks":[...]} and data-fixwords-mark items.
async function openMarks(config, options = {}) {
  const context = await env.browser.newContext(options);
  const page = await context.newPage();
  page.errors = problems(page);
  page.markConfig = config;
  await page.route('**/marks-page.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body:
    require('node:fs').readFileSync('tests/fixtures/marks.html', 'utf8').replace(/<meta name="fixwords"[^>]*>/,
      page.markConfig === null ? '' : '<meta name="fixwords" content=\'' + JSON.stringify(page.markConfig) + '\'>') }));
  await page.goto(env.base + '/marks-page.html');
  return page;
}
const verdicts = (p, id) => p.locator('#' + id + ' .fixwords-marks button');
const checked = async (p, id) => (await verdicts(p, id).evaluateAll(b => b.map(x => x.getAttribute('aria-checked')))).join(',');
const storedMarks = p => p.evaluate(() => (JSON.parse(localStorage.getItem('fixwords:' + location.pathname)) || {}).marks);
test('marks: one radio group per item with the configured labels; invalid config adds none', async () => {
  const p = await openMarks({ marks: ['OK', 'NG', '例外'] });
  assert.equal(await p.locator('.fixwords-marks').count(), 4);
  assert.deepEqual(await verdicts(p, 'm1').allTextContents(), ['OK', 'NG', '例外']);
  assert.equal(await p.locator('#m1 .fixwords-marks').getAttribute('role'), 'radiogroup');
  assert.equal(await p.locator('#m1 .fixwords-marks').getAttribute('aria-label'), '1');
  assert.equal(await p.locator('#m3 .fixwords-marks').getAttribute('aria-label'), '3');
  assert.deepEqual(await verdicts(p, 'm1').evaluateAll(b => b.map(x => [x.type, x.getAttribute('role'), x.getAttribute('aria-checked')])),
    [['button', 'radio', 'false'], ['button', 'radio', 'false'], ['button', 'radio', 'false']]);
  assert.equal(await p.locator('#fixwords-bar').getAttribute('data-idle'), '');
  await done(p);
  const clean = await openMarks({ marks: [' OK ', 'OK', 'NG', 'この選択肢は十二文字を超えています', 7, '  '] });
  assert.deepEqual(await verdicts(clean, 'm1').allTextContents(), ['OK', 'NG']);
  await done(clean);
  for (const marks of [['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'OK', [], ['', '  ', 3], { OK: 1 }, null]) {
    const q = await openMarks({ marks });
    assert.equal(await q.locator('.fixwords-marks').count(), 0);
    assert.equal(await q.locator('#m1 > span:first-child').count(), 0);
    await done(q);
  }
  const six = await openMarks({ marks: ['a', 'b', 'c', 'd', 'e', 'f'] });
  assert.equal(await verdicts(six, 'm1').count(), 6);
  await done(six);
  const none = await openMarks(null);
  assert.equal(await none.locator('.fixwords-marks').count(), 0);
  await done(none);
});
test('marks: click selects, a second click clears, duplicate ids stay in sync', async () => {
  const p = await openMarks({ marks: ['OK', 'NG', '例外'] });
  await verdicts(p, 'm1').nth(0).click();
  assert.equal(await checked(p, 'm1'), 'true,false,false');
  assert.equal(await checked(p, 'm4'), 'true,false,false');
  await verdicts(p, 'm4').nth(1).click();
  assert.equal(await checked(p, 'm1'), 'false,true,false');
  assert.equal(await checked(p, 'm4'), 'false,true,false');
  assert.equal(await checked(p, 'm2'), 'false,false,false');
  assert.deepEqual(await storedMarks(p), { 1: 'NG' });
  await verdicts(p, 'm1').nth(1).click();
  assert.equal(await checked(p, 'm4'), 'false,false,false');
  assert.equal(await storedMarks(p), undefined);
  await verdicts(p, 'm3').nth(2).click();
  assert.deepEqual(await storedMarks(p), { 3: '例外' });
  assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)).v)), 1);
  await done(p);
});
test('marks: verdicts survive a reload; a verdict whose choice left the meta is dropped', async () => {
  const p = await openMarks({ marks: ['OK', 'NG', '例外'] });
  await verdicts(p, 'm1').nth(0).click();
  await verdicts(p, 'm2').nth(2).click();
  await p.reload();
  assert.equal(await checked(p, 'm1'), 'true,false,false');
  assert.equal(await checked(p, 'm2'), 'false,false,true');
  assert.equal(await p.locator('#fixwords-bar').getAttribute('data-idle'), null);
  p.markConfig = { marks: ['OK', 'NG'] };
  await p.reload();
  assert.equal(await checked(p, 'm1'), 'true,false');
  assert.equal(await verdicts(p, 'm2').count(), 2);
  assert.equal(await checked(p, 'm2'), 'false,false');
  await verdicts(p, 'm3').nth(0).click();
  assert.deepEqual(await storedMarks(p), { 1: 'OK', 3: 'OK' });
  assert.equal(new URL(p.url()).search + new URL(p.url()).hash, '');
  await done(p);
});
test('marks: report lists verdicts grouped in config order before edits, in ja and en', async () => {
  for (const lang of ['ja', 'en']) {
    const p = await openMarks(lang === 'ja' ? { marks: ['OK', 'NG', '例外'] } : { lang: 'en', title: 'Acceptance', marks: ['OK', 'NG', 'Hold'] },
      { permissions: ['clipboard-read', 'clipboard-write'] });
    await verdicts(p, 'm2').nth(1).click();
    await verdicts(p, 'm1').nth(0).click();
    await start(p);
    await edit(p, '#m3 > span:first-child', lang === 'ja' ? 'メールが即時に届く' : 'Mail arrives');
    await p.locator('#fixwords-send').click();
    const report = await p.evaluate(() => navigator.clipboard.readText());
    assert.equal(report, lang === 'ja'
      ? '受け入れ確認 文言の直し\n\n判定（3件中 2件）\nOK：1\nNG：2\n未判定：3\n\n1. 元：メールが届く\n   新：メールが即時に届く'
      : 'Acceptance — Wording changes\n\nVerdicts (2 of 3)\nOK: 1\nNG: 2\nUnmarked: 3\n\n1. Before: メールが届く\n   After: Mail arrives');
    await done(p);
  }
  const q = await openMarks({ marks: ['OK', 'NG', '例外'] }, { permissions: ['clipboard-read', 'clipboard-write'] });
  for (const [id, i] of [['m1', 0], ['m2', 0], ['m3', 2]]) await verdicts(q, id).nth(i).click();
  await q.locator('#fixwords-send').click();
  assert.equal(await q.evaluate(() => navigator.clipboard.readText()), '受け入れ確認 文言の直し\n\n判定（3件中 3件）\nOK：1, 2\n例外：3');
  await done(q);
});
test('marks: bar status and send button count verdicts, edits and comments', async () => {
  for (const lang of ['ja', 'en']) {
    const p = await openMarks({ lang, marks: ['OK', 'NG'] }, { permissions: ['clipboard-read', 'clipboard-write'] });
    const ja = lang === 'ja';
    assert.equal(await p.locator('#fixwords-send').getAttribute('aria-disabled'), 'true');
    await verdicts(p, 'm1').nth(0).click();
    assert.equal(await p.locator('#fixwords-send').getAttribute('aria-disabled'), 'false');
    assert.equal(await p.locator('#fixwords-status').textContent(), ja ? '判定 1/3 ・ まだ送っていません' : 'Verdicts 1/3 · Not sent yet');
    assert.equal(await p.locator('#fixwords-send').textContent(), ja ? '結果を送る（判定 1/3）' : 'Send results (Verdicts 1/3)');
    await start(p);
    await edit(p, '#m3 > span:first-child', 'Mail');
    assert.equal(await p.locator('#fixwords-status').textContent(), ja ? '判定 1/3・直し 1 か所 ・ まだ送っていません' : 'Verdicts 1/3, changes: 1 · Not sent yet');
    assert.equal(await p.locator('#fixwords-send').textContent(), ja ? '結果を送る（判定 1/3・直し 1 か所）' : 'Send results (Verdicts 1/3, changes: 1)');
    await openComment(p, '#m1 > span:first-child');
    await p.locator('#fixwords-note-input').fill('Why?'); await p.keyboard.press('Control+Enter');
    assert.equal(await p.locator('#fixwords-send').textContent(), ja ? '結果を送る（判定 1/3・直し 1 か所・コメント 1 件）' : 'Send results (Verdicts 1/3, changes: 1, comments: 1)');
    await p.locator('#fixwords-send').click();
    await p.locator('#fixwords-panel').waitFor();
    assert.equal(await p.locator('#fixwords-status').textContent(), ja ? '判定 1/3・直し 1 か所・コメント 1 件 ・ 送る文章はコピー済みです' : 'Verdicts 1/3, changes: 1, comments: 1 · Copied');
    await done(p);
  }
});
test('marks: an item with its own text stays editable and keeps its buttons after the edit', async () => {
  const p = await openMarks({ marks: ['OK', 'NG'] }, { permissions: ['clipboard-read', 'clipboard-write'] });
  assert.equal(await p.locator('#m1 > span:first-child').first().textContent(), 'ログインできる');
  assert.equal(await p.locator('#m1').evaluate(n => n.firstElementChild.nextElementSibling.className), 'fixwords-marks');
  await start(p);
  assert.equal(await p.locator('#m1 > span:first-child').first().getAttribute('contenteditable'), 'plaintext-only');
  assert.equal(await p.locator('#m2a').getAttribute('contenteditable'), 'plaintext-only');
  assert.equal(await p.locator('#m2 > span').count(), 1);
  await edit(p, '#m1 > span:first-child', 'ログインに成功する');
  assert.equal(await verdicts(p, 'm1').count(), 2);
  await verdicts(p, 'm1').nth(1).click();
  await edit(p, '#m2a', '決済');
  assert.equal(await verdicts(p, 'm2').count(), 2);
  await p.locator('#fixwords-send').click();
  assert.equal(await p.evaluate(() => navigator.clipboard.readText()),
    '受け入れ確認 文言の直し\n\n判定（3件中 1件）\nNG：1\n未判定：2, 3\n\n1. 元：ログインできる\n   新：ログインに成功する\n\n2. 元：支払い\n   新：決済');
  await p.reload();
  assert.equal(await p.locator('#m1 > span:first-child').first().textContent(), 'ログインに成功する');
  assert.equal(await checked(p, 'm1'), 'false,true');
  await done(p);
});
test('marks: buttons are never editable and never open a comment field', async () => {
  const p = await openMarks({ marks: ['OK', 'NG'] });
  await start(p);
  assert.equal(await p.locator('.fixwords-marks [contenteditable], .fixwords-marks[contenteditable], [data-fixwords-editable] .fixwords-marks').count(), 0);
  await verdicts(p, 'm1').nth(0).click();
  assert.equal(await p.locator('#fixwords-note-input').count(), 0);
  assert.equal(await checked(p, 'm1'), 'true,false');
  assert.equal(await p.locator('.fixwords-marks [tabindex="0"][role="button"], .fixwords-marks[role="button"]').count(), 0);
  await verdicts(p, 'm1').nth(1).click();
  assert.equal(await p.locator('#fixwords-note-input').count(), 0);
  assert.equal(await checked(p, 'm1'), 'false,true');
  await verdicts(p, 'm3').nth(0).focus();
  await p.keyboard.press('Enter');
  assert.equal(await p.locator('#fixwords-note-input').count(), 0);
  assert.equal(await checked(p, 'm3'), 'true,false');
  await openComment(p, '#m1 > span:first-child');
  assert.equal(await p.locator('#fixwords-note-input').count(), 1);
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('[data-fixwords-noted]').count(), 0);
  await done(p);
});
test('marks: undo all clears verdicts too', async () => {
  const p = await openMarks({ marks: ['OK', 'NG'] });
  await verdicts(p, 'm1').nth(0).click();
  await verdicts(p, 'm3').nth(1).click();
  await p.locator('#fixwords-reset').click();
  let message = '';
  p.once('dialog', async d => { message = d.message(); await d.accept(); });
  await p.locator('#fixwords-reset-all').click();
  assert.equal(message, '直した文言とコメント、判定をすべて元に戻します。よろしいですか？');
  assert.equal(await checked(p, 'm1'), 'false,false');
  assert.equal(await checked(p, 'm4'), 'false,false');
  assert.equal(await checked(p, 'm3'), 'false,false');
  assert.equal(await storedMarks(p), undefined);
  assert.equal(await p.locator('#fixwords-send').getAttribute('aria-disabled'), 'true');
  await done(p);
  const en = await openMarks({ marks: ['OK', 'NG'], lang: 'en' });
  await verdicts(en, 'm1').nth(0).click();
  await en.locator('#fixwords-reset').click();
  en.once('dialog', async d => { message = d.message(); await d.dismiss(); });
  await en.locator('#fixwords-reset-all').click();
  assert.equal(message, 'Reset all your wording changes, comments and verdicts?');
  await done(en);
});
test('marks: dark colour scheme reaches the verdict buttons', async () => {
  const colours = async scheme => {
    const p = await openMarks({ marks: ['OK', 'NG'] }, { colorScheme: scheme });
    await verdicts(p, 'm1').nth(0).click();
    const c = await verdicts(p, 'm1').evaluateAll(b => b.map(x => getComputedStyle(x).backgroundColor));
    await done(p);
    return c;
  };
  assert.deepEqual(await colours('light'), ['rgb(11, 110, 102)', 'rgb(255, 255, 255)']);
  assert.deepEqual(await colours('dark'), ['rgb(53, 179, 167)', 'rgb(31, 35, 41)']);
});
test('marks: an id that is an Object.prototype name survives a reload', async () => {
  const p = await openMarks({ marks: ['OK', 'NG'] });
  await p.route('**/proto-page.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body:
    require('node:fs').readFileSync('tests/fixtures/marks.html', 'utf8').replace('data-fixwords-mark="2"', 'data-fixwords-mark="__proto__"') }));
  await p.goto(env.base + '/proto-page.html');
  await verdicts(p, 'm2').nth(1).click();
  await p.reload();
  // The fixture's own meta offers OK, NG and 例外.
  assert.equal(await checked(p, 'm2'), 'false,true,false');
  await done(p);
});

async function deleteBlock(p, selector) {
  await p.locator(selector).focus();
  await p.locator('#fixwords-delete').click();
}
async function blockReport(p) {
  await p.locator('#fixwords-send').click();
  await p.locator('#fixwords-panel').waitFor();
  const value = await p.locator('#fixwords-panel textarea').inputValue();
  await p.locator('#fixwords-panel').getByRole('button', { name: /^(Close|閉じる)$/ }).click();
  return value;
}
test('deletions: row from cell, original text, focus, suppressed edits and notes survive reload and undo', async () => {
  const p = await open('blocks'); await start(p);
  await edit(p, '#cell1', 'Edited');
  await openComment(p, '#cell2');
  await p.locator('#fixwords-note-input').fill('Question?'); await p.keyboard.press('Control+Enter');
  await deleteBlock(p, '#cell1');
  assert.equal(await p.locator('#row').getAttribute('data-fixwords-deleted'), '');
  assert.equal(await p.locator('#row [contenteditable], #row [tabindex]').count(), 0);
  assert.equal(await p.locator('.fixwords-deleted-tag').evaluate(n => n === document.activeElement), true);
  assert.equal(await p.locator('.fixwords-note-pin').count(), 0);
  let value = await blockReport(p);
  assert.match(value, /1\. 削除：One ／ Two/); assert.doesNotMatch(value, /新：|Question/);
  await p.reload(); await start(p);
  await p.locator('.fixwords-deleted-tag').click();
  assert.equal(await p.locator('#cell1').textContent(), 'Edited');
  value = await blockReport(p); assert.match(value, /新：Edited/); assert.match(value, /Question/);
  await done(p);
});
test('deletions: paragraph occurrence, heading, list item, fallback block, document order and undo list', async () => {
  const p = await open('blocks'); await start(p);
  await deleteBlock(p, '#para2'); await deleteBlock(p, '#item > span:first-child');
  await p.locator('#item .fixwords-marks button').first().click();
  assert.equal(await p.locator('#item .fixwords-marks button').first().getAttribute('aria-checked'), 'true');
  await deleteBlock(p, '#heading'); await deleteBlock(p, '#plain');
  const value = await blockReport(p);
  assert.match(value, /1\. 削除：Section/);
  assert.match(value, /2\. 削除（2か所目／全2か所・見出し「Section」の下）：Repeated/);
  assert.match(value, /3\. 削除：List text/); assert.match(value, /4\. 削除：Plain block/);
  await p.locator('#fixwords-reset').click();
  assert.equal(await p.locator('.fixwords-row').count(), 4);
  await p.locator('.fixwords-row button').first().click();
  assert.equal(await p.locator('#heading').getAttribute('data-fixwords-deleted'), null);
  await p.locator('#fixwords-undo').click();
  assert.equal(await p.locator('#heading').getAttribute('data-fixwords-deleted'), '');
  p.once('dialog', d => d.accept()); await p.locator('#fixwords-reset-all').click();
  assert.equal(await p.locator('[data-fixwords-deleted], .fixwords-deleted-tag').count(), 0);
  await done(p);
});
test('deletions: localized counts, toolbar geometry and SVG exclusion', async () => {
  for (const lang of ['ja', 'en']) for (const width of [390, 1280]) for (const colorScheme of ['light', 'dark']) {
    const p = await open('blocks', { viewport: { width, height: 900 }, colorScheme });
    await p.route('**/localized.html', r => r.fulfill({ contentType: 'text/html', body:
      require('node:fs').readFileSync('tests/fixtures/blocks.html', 'utf8').replace('lang="ja"', 'lang="' + lang + '"').replace('{"marks":["OK","NG"]}', '{}') }));
    await p.goto(env.base + '/localized.html'); await start(p);
    await edit(p, '#para1', 'Changed'); await deleteBlock(p, '#cell1');
    assert.equal(await p.locator('#fixwords-send').textContent(), lang === 'ja' ? '直した内容を送る（直し 1 か所・削除 1 か所）' : 'Send your changes (changes: 1, deletions: 1)');
    assert.match(await p.locator('#fixwords-status').textContent(), lang === 'ja' ? /直し 1 か所・削除 1 か所/ : /changes: 1, deletions: 1/);
    await p.locator('#para2').focus();
    const box = await p.locator('#fixwords-tools').boundingBox(), bar = await p.locator('#fixwords-bar').boundingBox();
    assert.ok(box.x >= 7 && box.x + box.width <= width - 7 && box.y >= 7 && box.y + box.height < bar.y);
    await p.locator('#svg').click(); assert.equal(await p.locator('#fixwords-delete').isVisible(), false);
    await done(p);
  }
});
test('deletions: old saved edits without deletes still load', async () => {
  const p = await open('en', {}, () => localStorage.setItem('fixwords:/en.html', JSON.stringify({ v: 1, edits: [{ o: 'Baked daily', i: 2, n: 2, t: 'Old edit' }] })));
  assert.equal(await p.locator('#dup2').textContent(), 'Old edit');
  assert.equal(await p.locator('[data-fixwords-deleted]').count(), 0); await done(p);
});

async function openNested(p, body) {
  await p.route('**/nested.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body:
    '<html lang="en"><title>Nested</title><body>' + body + '<script src="/fixwords.js"></script></body></html>' }));
  await p.goto(env.base + '/nested.html');
}
for (const kind of ['list', 'table']) {
  test('deletions: nested ' + kind + ' originals, counts and child state survive outer undo and reload', async () => {
    const p = await open();
    await openNested(p, kind === 'list'
      ? '<ul><li><span id="parent">Parent</span><ul><li id="child">Child</li></ul><span>Tail</span></li></ul>'
      : '<table><tr><td id="parent">Parent</td><td><table><tr><td id="child">Child</td></tr></table></td><td>Tail</td></tr></table>');
    await start(p);
    await edit(p, '#child', 'Changed child');
    await note(p, '#child', 'Child question');
    // An outer deletion alone suppresses the child's edit and note, using source originals.
    await deleteBlock(p, '#parent');
    let report = await blockReport(p);
    assert.match(report, /1\. Delete: Parent \/ Child \/ Tail/);
    assert.doesNotMatch(report, /After:|Child question/);
    await p.locator('.fixwords-deleted-tag').click();
    report = await blockReport(p);
    assert.match(report, /After: Changed child/);
    assert.match(report, /Child question/);
    await deleteBlock(p, '#child');
    await deleteBlock(p, '#parent');
    assert.equal(await p.locator('#fixwords-send').textContent(), 'Send your changes (deletions: 1)');
    assert.equal(await p.locator('.fixwords-deleted-tag').count(), 1);
    report = await blockReport(p);
    assert.match(report, /1\. Delete: Parent \/ Child \/ Tail/);
    assert.doesNotMatch(report, /2\.|Changed child|Child question/);
    await p.reload(); await start(p);
    await p.locator('.fixwords-deleted-tag').click();
    assert.equal(await p.locator('#child').getAttribute('contenteditable'), null);
    assert.match(await blockReport(p), /1\. Delete: Child/);
    await p.locator('.fixwords-deleted-tag').click();
    report = await blockReport(p);
    assert.match(report, /After: Changed child/);
    assert.match(report, /Child question/);
    await done(p);
  });
}
test('toolbar: click and tap on non-focusable text hide it; toolbar and note retain focus access', async () => {
  for (const touch of [false, true]) {
    const p = await open('en', { hasTouch: touch });
    await start(p);
    await p.locator('#dup1').focus();
    await p.keyboard.press('Tab');
    assert.equal(await p.locator('#fixwords-tools').isVisible(), true);
    await p.keyboard.press('Escape');
    await p.locator('#fixwords-tools button').first().click();
    assert.equal(await p.locator('#fixwords-note-input').isVisible(), true);
    await p.keyboard.press('Escape');
    // A newly inserted static node is deliberately outside the boot-time editable items.
    await p.evaluate(() => {
      const text = document.createElement('div'); text.id = 'static-text'; text.textContent = 'Static text';
      text.style.cssText = 'position:fixed;top:250px;left:10px'; document.body.append(text);
    });
    await p.locator('#dup1').focus();
    if (touch) await p.locator('#static-text').tap(); else await p.locator('#static-text').click();
    assert.equal(await p.evaluate(() => document.activeElement === document.body), true);
    await p.waitForFunction(() => document.querySelector('#fixwords-tools').hidden);
    await done(p);
  }
});
test('deletions: suppressed SVG boxes disappear and own tabindex survives saved deletion and restore', async () => {
  const p = await open();
  await openNested(p, '<ul><li><span id="parent">Parent</span><svg width="100" height="40"><text id="label" tabindex="-1" role="note" x="0" y="20">Label</text></svg></li></ul>');
  await start(p);
  assert.equal(await p.locator('.fixwords-box').count(), 1);
  await deleteBlock(p, '#parent');
  assert.equal(await p.locator('.fixwords-box').count(), 0);
  assert.equal(await p.locator('#label').getAttribute('tabindex'), null);
  await p.reload(); await start(p);
  assert.equal(await p.locator('.fixwords-box').count(), 0);
  await p.locator('.fixwords-deleted-tag').click();
  assert.equal(await p.locator('.fixwords-box').count(), 1);
  await p.getByRole('button', { name: 'Finish editing', exact: true }).click();
  assert.equal(await p.locator('#label').getAttribute('tabindex'), '-1');
  assert.equal(await p.locator('#label').getAttribute('role'), 'note');
  await done(p);
});

});
