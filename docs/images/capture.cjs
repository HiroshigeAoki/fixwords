// Regenerates the README screenshots: node docs/images/capture.cjs (from the repository root).
// Drives the real fixwords UI on the invented pages in docs/images/pages/ and asserts the DOM
// state before every screenshot, so a UI change that breaks a shot fails loudly.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const OUT = __dirname;
const PAGES = path.join(OUT, 'pages');
const WIDTH = 600;

const TEXT = {
  en: {
    intro: 'Unlock seamless collaboration by effortlessly booking your perfect space.', introNew: 'Pick a date and time to book a room.',
    label: 'Approval process in progress', labelNew: 'Awaiting approval',
    question: 'Say who approves it?',
    other: 'Bookings cannot be cancelled.', otherNote: 'Not even the day before?',
    before: 'Before:', comment: 'Comment on:', title: 'Room booking (mockup) — Wording changes',
    checklistTitle: 'Acceptance check',
  },
  ja: {
    intro: 'シームレスな予約体験で、チームの生産性を最大化しましょう。', introNew: '日時を選んで、会議室を予約します。',
    label: '承認プロセスを実行中', labelNew: '承認待ち',
    question: '誰が承認するかも書きませんか？',
    other: '予約は取り消せません。', otherNote: '前日でも取り消せませんか？',
    before: '元：', comment: 'コメント（対象：', title: '会議室予約（モック） 文言の直し',
    checklistTitle: '受け入れ確認',
  },
};

function assert(cond, message) {
  if (!cond) throw new Error('Assertion failed: ' + message);
}
const url = file => pathToFileURL(path.join(PAGES, file)).href;

async function open(browser, file, { clipboard = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: 1000 }, deviceScaleFactor: 2,
    colorScheme: 'light', reducedMotion: 'reduce', locale: file.endsWith('.ja.html') ? 'ja-JP' : 'en-US',
    permissions: clipboard ? ['clipboard-read', 'clipboard-write'] : [],
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url(file));
  assert(!errors.length, 'page errors: ' + errors.join('; '));
  return { context, page };
}

// Fit the viewport to the content (the bar's spacer is part of the body), then screenshot.
async function shoot(page, name, extra) {
  const height = await page.evaluate(() => {
    const r = document.body.getBoundingClientRect();
    let bottom = r.bottom + window.scrollY;
    const input = document.querySelector('#fixwords-note-input');
    if (input) bottom = Math.max(bottom, input.getBoundingClientRect().bottom + window.scrollY + 16);
    return Math.ceil(bottom);
  });
  await page.setViewportSize({ width: WIDTH, height: Math.max(height, 200) });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, ...(extra || {}) });
  return file;
}

async function rewrite(page, selector, value) {
  const node = page.locator(selector); // a text-based selector would stop matching once the text changes
  await node.fill(value);
  await node.blur();
}

// The edits shown in edit-<lang>.png: the first paragraph and the first figure label.
async function makeEdits(page, s) {
  await page.locator('#fixwords-title').click();
  assert((await page.locator('h1 + p').textContent()) === s.intro, 'first paragraph is the intro');
  await rewrite(page, 'h1 + p', s.introNew);
  await page.locator('svg text').first().click();
  const input = page.locator('#fixwords-svg-input');
  await input.waitFor();
  await input.fill(s.labelNew);
  await input.press('Enter');
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}

async function assertEdits(page, s) {
  const p = page.locator(`p:text-is("${s.introNew}")`);
  assert(await p.count() === 1, 'edited paragraph text is present');
  assert(await p.getAttribute('data-fixwords-changed') !== null, 'edited paragraph has data-fixwords-changed');
  const label = page.locator('svg text').first();
  assert((await label.textContent()).trim() === s.labelNew, 'edited figure label text is present');
  assert(await label.getAttribute('data-fixwords-changed') !== null, 'edited figure label has data-fixwords-changed');
  assert(await page.locator('svg rect.fixwords-box.changed').count() === 1, 'changed figure label has its highlight box');
  assert(await page.locator('#fixwords-bar[data-visible]').isVisible(), 'fixwords bar is visible');
  const status = await page.locator('#fixwords-status').textContent();
  assert(/2/.test(status), 'status shows 2 changes: ' + status);
}

async function comment(page, selector, value, save) {
  await page.locator(selector).click();
  const box = page.locator('#fixwords-note-input');
  await box.waitFor();
  await box.fill(value);
  if (save) await box.press('Control+Enter');
}

async function editShot(browser, lang) {
  const s = TEXT[lang];
  const { context, page } = await open(browser, `booking.${lang}.html`);
  await makeEdits(page, s);
  await assertEdits(page, s);
  const file = await shoot(page, `edit-${lang}.png`);
  await context.close();
  return file;
}

async function commentShot(browser, lang) {
  const s = TEXT[lang];
  const { context, page } = await open(browser, `booking.${lang}.html`);
  await page.locator('#fixwords-title').click();
  await page.locator('#fixwords-comment').click();
  assert(await page.locator('#fixwords-comment[aria-pressed=true]').count() === 1, 'comment mode is on');
  await comment(page, `p:text-is("${s.intro}")`, s.question, true);
  assert(await page.locator(`p:text-is("${s.intro}")[data-fixwords-noted]`).count() === 1, 'saved comment has the dotted underline attribute');
  // Leave room under the last paragraph so the comment box opens below it instead of over the figure.
  await page.addStyleTag({ content: 'body { padding-bottom: 120px; }' });
  await comment(page, `p:text-is("${s.other}")`, s.otherNote, false);
  const box = page.locator('#fixwords-note-input');
  assert(await box.isVisible() && await box.inputValue() === s.otherNote, 'comment box is open with the note typed');
  const file = await shoot(page, `comment-${lang}.png`);
  await context.close();
  return file;
}

// Returns the text fixwords copied to the clipboard for the edits plus one comment.
async function copiedText(browser, lang) {
  const s = TEXT[lang];
  const { context, page } = await open(browser, `booking.${lang}.html`, { clipboard: true });
  await makeEdits(page, s);
  await assertEdits(page, s);
  await page.locator('#fixwords-comment').click();
  await comment(page, `p:text-is("${s.other}")`, s.otherNote, true);
  await page.locator('#fixwords-send').click();
  await page.locator('#fixwords-note[data-mode=copied]').waitFor();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  await context.close();
  assert(copied.startsWith(s.title), 'clipboard text starts with the report title: ' + JSON.stringify(copied.slice(0, 60)));
  assert(copied.includes(s.before) && copied.includes(s.introNew) && copied.includes(s.labelNew) &&
    copied.includes(s.comment) && copied.includes(s.otherNote), 'clipboard text has the edits and the comment');
  return copied;
}

async function pasteShot(browser, lang) {
  const s = TEXT[lang];
  const copied = await copiedText(browser, lang);
  if (process.env.CAPTURE_VERBOSE) console.error(`--- ${lang} clipboard ---\n${copied}`);
  const { context, page } = await open(browser, `chat.${lang}.html`);
  await page.locator('#report').evaluate((node, value) => { node.textContent = value; }, copied);
  const shown = await page.locator('#report').textContent();
  assert(shown === copied && shown.includes(s.before), 'chat block holds the copied text');
  const file = await shoot(page, `paste-${lang}.png`);
  await context.close();
  return file;
}

async function verdictShot(browser, lang) {
  const s = TEXT[lang];
  const { context, page } = await open(browser, `checklist.${lang}.html`);
  const picks = [['1', 'OK'], ['2', 'NG'], ['4', 'OK']];
  for (const [id, label] of picks) {
    await page.locator(`[data-fixwords-mark="${id}"] button[role=radio]`).filter({ hasText: new RegExp('^' + label + '$') }).click();
  }
  for (const id of ['1', '2', '3', '4', '5']) {
    assert(await page.locator(`[data-fixwords-mark="${id}"] button[role=radio]`).count() === 3, 'item ' + id + ' has 3 verdict buttons');
    const pressed = await page.locator(`[data-fixwords-mark="${id}"] button[aria-checked=true]`).allTextContents();
    const want = picks.filter(p => p[0] === id).map(p => p[1]);
    assert(JSON.stringify(pressed) === JSON.stringify(want), `item ${id} pressed: ${JSON.stringify(pressed)}`);
  }
  assert(await page.locator('#fixwords-bar[data-visible]').isVisible(), 'fixwords bar is visible');
  const status = await page.locator('#fixwords-status').textContent();
  assert(/3\/5/.test(status), 'status shows 3/5 verdicts: ' + status);
  assert((await page.title()) === s.checklistTitle, 'checklist title');
  const file = await shoot(page, `verdicts-${lang}.png`);
  await context.close();
  return file;
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  assert(b.toString('latin1', 1, 4) === 'PNG', file + ' is a PNG');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b.length };
}

function shrink(file) {
  try {
    const tmp = file + '.tmp.png';
    execFileSync('magick', [file, '+dither', '-colors', '128', '-strip', 'PNG8:' + tmp], { stdio: 'ignore' });
    fs.renameSync(tmp, file);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    console.warn('magick not found: ' + path.basename(file) + ' stays full-colour (larger than the committed PNG)');
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const files = [];
  try {
    for (const lang of ['en', 'ja']) {
      files.push(await editShot(browser, lang));
      files.push(await commentShot(browser, lang));
      files.push(await pasteShot(browser, lang));
      files.push(await verdictShot(browser, lang));
    }
  } finally {
    await browser.close();
  }
  let total = 0;
  for (const file of files) {
    shrink(file);
    const { width, height, bytes } = pngSize(file);
    assert(width === WIDTH * 2, `${path.basename(file)} is ${WIDTH * 2}px wide, got ${width}`);
    total += bytes;
    console.log(`${path.basename(file)} ${width}x${height} ${bytes} bytes`);
  }
  console.log(`total ${total} bytes`);
})().catch(e => { console.error(e); process.exit(1); });
