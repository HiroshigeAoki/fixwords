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
  await p.locator('#fixwords-title').focus();
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

const commentToggle = p => p.locator('#fixwords-comment');
async function note(p, selector, value, key = 'Control+Enter') {
  await p.locator(selector).click();
  await p.locator('#fixwords-note-input').fill(value);
  if (key) await p.keyboard.press(key);
}
test('comments: mode toggle, open/save/cancel/delete/blur and Enter behaviour on HTML text', async () => {
  const p = await open('en');
  assert.equal(await commentToggle(p).isVisible(), false);
  await start(p);
  assert.equal(await commentToggle(p).getAttribute('aria-pressed'), 'false');
  await commentToggle(p).click();
  assert.equal(await commentToggle(p).getAttribute('aria-pressed'), 'true');
  assert.equal(await p.locator('#dup1').getAttribute('contenteditable'), null);
  assert.equal(await p.locator('#fixwords-pagenote').isVisible(), true);
  await p.locator('#dup1').click();
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
  await p.locator('#dup1').click();
  assert.equal(await input.inputValue(), 'Same on holidays?');
  await input.fill('Changed my mind'); await p.keyboard.press('Escape');
  assert.equal(await input.count(), 0);
  await p.locator('#dup1').click();
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
  await p.locator('#dup2').click(); await input.fill('  second  ');
  await p.locator('#fixwords-title').focus();
  assert.equal(await input.count(), 0);
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
  await note(p, '#dup1', '   ');
  assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-noted'), null);
  assert.equal(await p.locator('#fixwords-status').textContent(), 'Changes: 0, comments: 1 · Not sent yet');
  // Back to edit mode restores contenteditable; the marker stays after editing ends.
  await commentToggle(p).click();
  assert.equal(await p.locator('#dup1').getAttribute('contenteditable'), 'plaintext-only');
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
  await commentToggle(p).click(); await commentToggle(p).click();
  await p.getByRole('button', { name: 'Finish editing', exact: true }).click();
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), '');
  assert.equal(await p.locator('#dup2').evaluate(n => getComputedStyle(n).textDecorationStyle), 'dotted');
  await done(p);
});
test('comments: SVG labels, page note, report, reset and counts in Japanese', async () => {
  const p = await open('ja', { permissions: ['clipboard-read', 'clipboard-write'] });
  await start(p);
  await commentToggle(p).click();
  assert.equal(await commentToggle(p).textContent(), '💬 コメント');
  assert.equal(await p.locator('#fixwords-pagenote').textContent(), 'ページ全体へのコメント');
  await p.locator('#label').click();
  assert.equal(await p.locator('#fixwords-svg-input').count(), 0);
  await p.locator('#fixwords-note-input').fill('袋なのはなぜ？'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.evaluate(() => document.activeElement.id), 'label');
  await p.locator('#span2').focus(); await p.keyboard.press('Enter');
  await p.locator('#fixwords-note-input').fill('二つ目'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.locator('svg rect.fixwords-box.noted').count(), 2);
  await p.locator('#fixwords-pagenote').click();
  assert.equal(await p.locator('#fixwords-note-input').inputValue(), '');
  await p.locator('#fixwords-note-input').fill('全体に短く'); await p.keyboard.press('Control+Enter');
  assert.equal(await p.locator('#fixwords-status').textContent(), '直し 0 か所・コメント 3 件 ・ まだ送っていません');
  await commentToggle(p).click();
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
test('comments: phone width, textarea stays in view, noted text survives an edit of the same element', async () => {
  const p = await open('en', { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  await start(p);
  await commentToggle(p).click();
  await p.locator('#dup1').click();
  const box = await p.locator('#fixwords-note-input').boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 390);
  assert.ok(box.height >= 44);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  await p.keyboard.type('Hi'); await p.keyboard.press('Control+Enter');
  await commentToggle(p).click();
  await edit(p, '#dup1', 'Fresh bread');
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname)));
  assert.deepEqual([stored.edits.length, stored.notes[0].o, stored.notes[0].c], [1, 'Baked daily', 'Hi']);
  await p.reload();
  assert.equal(await p.locator('#dup1').textContent(), 'Fresh bread');
  assert.equal(await p.locator('#dup1').getAttribute('data-fixwords-noted'), '');
  await done(p);
});


// Revert one edit from a list.
const resetBtn = p => p.locator('#fixwords-reset');
const rowsOf = p => p.locator('#fixwords-panel .fixwords-row');
const activeId = p => p.evaluate(() => document.activeElement.id);
async function openList(p) { await resetBtn(p).click(); await p.locator('#fixwords-list-title').waitFor(); }
async function stored(p) { return p.evaluate(() => JSON.parse(localStorage.getItem('fixwords:' + location.pathname))); }
const L = {
  en: { title: 'Which change do you want to undo?', none: 'No changes yet', all: 'Undo all', restore: 'Restore', row: 'Undo',
    unsent: 'Changes: 2 · Not sent yet', orig: 'Baked daily', first: 'First line\nSecond line' },
  ja: { title: 'どれを元に戻しますか', none: '直した箇所はありません', all: 'すべて元に戻す', restore: '取り消す', row: '元に戻す',
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
test('revert one: reverting the last text leaves an empty list, hides Undo all, focus goes to Restore and then to the title button', async () => {
  const p = await open('en');
  await start(p);
  await edit(p, '#dup1', 'One');
  await openList(p);
  await rowsOf(p).nth(0).locator('button').click();
  assert.equal(await p.locator('#fixwords-panel').textContent().then(x => x.includes('No changes yet')), true);
  assert.equal(await p.locator('#fixwords-notice').isVisible(), true);
  assert.equal(await p.locator('#fixwords-reset-all').isVisible(), false);
  assert.equal(await activeId(p), 'fixwords-undo');
  await p.keyboard.press('Escape');
  assert.equal(await activeId(p), 'fixwords-title');
  await done(p);
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
  await commentToggle(p).click();
  await p.locator('#dup2').click();
  await p.locator('#fixwords-note-input').fill('Why?'); await p.keyboard.press('Control+Enter');
  await commentToggle(p).click();
  await openList(p);
  assert.equal(await rowsOf(p).count(), 1);
  await rowsOf(p).nth(0).locator('button').click();
  assert.equal(await p.locator('#dup1').textContent(), 'Baked daily');
  assert.equal((await stored(p)).notes.length, 1);
  assert.equal(await p.locator('#fixwords-reset-all').isVisible(), true);
  assert.ok((await p.locator('#fixwords-panel').textContent()).includes('No changes yet'));
  p.once('dialog', async d => { await d.accept(); });
  await p.locator('#fixwords-reset-all').click();
  assert.equal((await stored(p)).notes, undefined);
  assert.equal(await p.locator('#dup2').getAttribute('data-fixwords-noted'), null);
  assert.equal(await p.locator('#fixwords-panel').isVisible(), false);
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

});
