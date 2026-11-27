// Wording edits, saved locally and shared as a plain-text report.
(function () {
  if (window.__fixwords) return;
  window.__fixwords = true;
  var STRINGS = {
  "ja": {
    "deleteRow": "🗑 この行を削除",
    "deleteItem": "🗑 この項目を削除",
    "deleteHeading": "🗑 この見出しを削除",
    "deletePara": "🗑 この段落を削除",
    "deletedTag": "削除 ・ 取り消す",
    "deleteLine": "削除",
    "statDeletes": "削除 {d} か所",
    "sendStats": "直した内容を送る（{parts}）",

    "startIdle": "✎ 文言を直す",
    "close": "閉じる",
    "hide": "隠す",
    "stepOne": "① 直したい文字をタップして書き換える",
    "stepDestination": "② 「直した内容を送る」を押す。",
    "stepTwo": "② 「直した内容を送る」を押して、依頼してきた人へのチャットやメールに貼る",
    "guide": "押さないと相手には届きません。",
    "continue": "続けて直す",
    "reset": "元に戻す",
    "sendLabel": "直した内容を送る",
    "reportLabel": "送る文章",
    "copyAgain": "もう一度コピー",
    "share": "アプリを選んで送る",
    "manualDone": "コピーできた",
    "stop": "直すのを終える",
    "empty": "まだ直した箇所はありません",
    "pending": "{n} か所を直しました ・ まだ送っていません",
    "sharedStatus": "{n} か所 ・ 共有済みです",
    "copiedStatus": "{n} か所 ・ 送る文章はコピー済みです",
    "sendCount": "直した内容を送る（{n} か所）",
    "open": "文言を直すツールを開く",
    "unsent": "（未送信 {n} か所）",
    "where": "依頼してきた人へのチャットやメールに貼り付けて送ってください。",
    "paste": "貼り付けて送ってください。",
    "sharedNote": "共有しました。送信まで済ませてください。",
    "copiedNote": "✓ コピーしました\nこのあと、{paste}\n貼り付けて送るまで、相手には届きません。",
    "cancelled": "送信を取りやめました。コピーして貼り付けることもできます。",
    "manualNote": "下の文章を長押し（パソコンは全選択）してコピーし、{paste}",
    "copy": "コピーする",
    "confirm": "直した文言をすべて元に戻します。よろしいですか？",
    "confirmMarks": "直した文言とコメント、判定をすべて元に戻します。よろしいですか？",
    "reportTitle": "{title} 文言の直し",
    "before": "元",
    "after": "   新：{text}",
    "occurrence": "（{index}か所目／全{total}か所{heading}）",
    "heading": "・見出し「{heading}」の下",
    "separator": "：",
    "noChanges": "（直した箇所はありません）",
    "figure": "（図）",
    "svgLabel": "図の文字を直す",
    "lineSeparator": " ／ ",
    "destinationEnd": "。",
    "iconClose": "×",
    "iconEdit": "✎",
    "comment": "💬 コメント",
    "pageComment": "ページ全体へのコメント",
    "commentEdit": "💬 コメントを直す",
    "toolsLabel": "この文言のツール",
    "notePin": "コメントを開く：{text}",
    "noteLabel": "コメントを書く",
    "pendingNotes": "直し {n} か所・コメント {m} 件 ・ まだ送っていません",
    "sharedStatusNotes": "直し {n} か所・コメント {m} 件 ・ 共有済みです",
    "copiedStatusNotes": "直し {n} か所・コメント {m} 件 ・ 送る文章はコピー済みです",
    "sendCountNotes": "直した内容を送る（直し {n} か所・コメント {m} 件）",
    "commentOn": "コメント（対象：{text}）",
    "commentPage": "コメント（ページ全体）",
    "noteLine": "   内容：{text}",
    "genre": "種類：{genre}",
    "listTitle": "どれを元に戻しますか",
    "listLabel": "元に戻す箇所を選ぶ",
    "rowUndo": "元に戻す",
    "restore": "取り消す",
    "resetAll": "すべて元に戻す",
    "locFigure": "図の文字",
    "locHeading": "見出し「{heading}」の下",
    "locOccurrence": "{index}か所目／全{total}か所",
    "locJoin": "・",
    "revertedAt": "{where}を元に戻しました",
    "revertedOne": "1か所",
    "was": "元：",
    "now": "新：",
    "emptied": "（空）",
    "rowLabel": "「{text}」を元に戻す{where}",
    "rowLabelEmpty": "空にした「{text}」を元に戻す{where}",
    "whereWrap": "（{where}）",
    "marksHead": "判定（{total}件中 {n}件）",
    "unmarked": "未判定",
    "statMarks": "判定 {k}/{all}",
    "statEdits": "直し {n} か所",
    "statNotes": "コメント {m} 件",
    "statJoin": "・",
    "tailPending": " ・ まだ送っていません",
    "tailShared": " ・ 共有済みです",
    "tailCopied": " ・ 送る文章はコピー済みです",
    "sendMarks": "結果を送る（{parts}）"
  },
  "en": {
    "deleteRow": "🗑 Delete this row",
    "deleteItem": "🗑 Delete this item",
    "deleteHeading": "🗑 Delete this heading",
    "deletePara": "🗑 Delete this paragraph",
    "deletedTag": "Deleted · Undo",
    "deleteLine": "Delete",
    "statDeletes": "deletions: {d}",
    "sendStats": "Send your changes ({parts})",

    "startIdle": "✎ Fix wording",
    "close": "Close",
    "hide": "Hide",
    "stepOne": "1. Tap the words you want to change and rewrite them.",
    "stepDestination": "2. Tap “Send your changes”. ",
    "stepTwo": "2. Tap “Send your changes”, then paste them into a chat or email to the author.",
    "guide": "Nothing reaches the author until you paste and send it.",
    "continue": "Keep editing",
    "reset": "Reset changes",
    "sendLabel": "Send your changes",
    "reportLabel": "Your changes",
    "copyAgain": "Copy again",
    "share": "Choose an app to share",
    "manualDone": "I copied it",
    "stop": "Finish editing",
    "empty": "No changes yet",
    "pending": "Changes: {n} · Not sent yet",
    "sharedStatus": "Changes: {n} · Shared",
    "copiedStatus": "Changes: {n} · Copied",
    "sendCount": "Send your changes ({n})",
    "open": "Open wording editor",
    "unsent": " (unsent: {n})",
    "where": "Paste the list into a chat or email to the author and send it.",
    "paste": "Paste the list and send it. ",
    "sharedNote": "Shared. Please finish sending in the app. ",
    "copiedNote": "✓ Copied\n{paste}\nNothing reaches the author until you paste and send it.",
    "cancelled": "Sharing cancelled. You can copy and paste your changes instead.",
    "manualNote": "Select the text below (touch and hold on a phone), copy it, then send it. {paste}",
    "copy": "Copy",
    "confirm": "Reset all your wording changes?",
    "confirmMarks": "Reset all your wording changes, comments and verdicts?",
    "reportTitle": "{title} — Wording changes",
    "before": "Before",
    "after": "   After: {text}",
    "occurrence": " (occurrence {index} of {total}{heading})",
    "heading": "; under “{heading}”",
    "separator": ": ",
    "noChanges": "(No changes)",
    "figure": "(figure) ",
    "svgLabel": "Edit figure label",
    "lineSeparator": " / ",
    "destinationEnd": ".",
    "iconClose": "×",
    "iconEdit": "✎",
    "comment": "💬 Comment",
    "pageComment": "Comment on the whole page",
    "commentEdit": "💬 Edit comment",
    "toolsLabel": "Tools for this text",
    "notePin": "Open comment: {text}",
    "noteLabel": "Write a comment",
    "pendingNotes": "Changes: {n}, comments: {m} · Not sent yet",
    "sharedStatusNotes": "Changes: {n}, comments: {m} · Shared",
    "copiedStatusNotes": "Changes: {n}, comments: {m} · Copied",
    "sendCountNotes": "Send your changes ({n} + {m} comments)",
    "commentOn": "Comment on: {text}",
    "commentPage": "Comment (whole page)",
    "noteLine": "   Note: {text}",
    "genre": "Type: {genre}",
    "listTitle": "Which change do you want to undo?",
    "listLabel": "Choose a change to undo",
    "rowUndo": "Undo",
    "restore": "Restore",
    "resetAll": "Undo all",
    "locFigure": "Figure text",
    "locHeading": "Under “{heading}”",
    "locOccurrence": "occurrence {index} of {total}",
    "locJoin": "; ",
    "revertedAt": "{where} was undone",
    "revertedOne": "1 change",
    "was": "Before: ",
    "now": "Now: ",
    "emptied": "(empty)",
    "rowLabel": "Undo “{text}”{where}",
    "rowLabelEmpty": "Undo the emptied “{text}”{where}",
    "whereWrap": " ({where})",
    "marksHead": "Verdicts ({n} of {total})",
    "unmarked": "Unmarked",
    "statMarks": "Verdicts {k}/{all}",
    "statEdits": "changes: {n}",
    "statNotes": "comments: {m}",
    "statJoin": ", ",
    "tailPending": " · Not sent yet",
    "tailShared": " · Shared",
    "tailCopied": " · Copied",
    "sendMarks": "Send results ({parts})"
  }
};
  function boot() {
  var meta = document.querySelector('meta[name="fixwords"]');
  var config = {};
  try {
    var parsed = JSON.parse(meta ? meta.getAttribute("content") || "" : "");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) config = parsed;
  } catch (e) { /* Use defaults for non-JSON content. */ }
  var lang = config.lang;
  if (lang !== "ja" && lang !== "en") {
    var pageLang = document.documentElement.getAttribute("lang") || navigator.language || "";
    lang = /^ja/i.test(pageLang) ? "ja" : "en";
  }
  var strings = STRINGS[lang];
  function t(key, values) {
    return strings[key].replace(/\{(\w+)\}/g, function (match, name) {
      return values && values[name] !== undefined ? values[name] : match;
    });
  }
  var KEY = "fixwords:" + location.pathname;
  var SKIP = "script, style, noscript, textarea, select, #fixwords-bar, #fixwords-panel, #fixwords-handle, #fixwords-svg-input, #fixwords-note-input, #fixwords-pagenote, [data-no-edit], .fixwords-marks";
  if (typeof config.skip === "string" && config.skip.trim()) {
    try {
      document.querySelector(config.skip);
      SKIP += ", " + config.skip;
    } catch (e) { /* Ignore invalid selectors. */ }
  }
  var title = typeof config.title === "string" ? config.title : document.title || location.pathname;
  var genre = typeof config.genre === "string" ? config.genre.replace(/\s+/g, " ").trim().slice(0, 40) : "";
  // Verdict choices: 1 to 6 distinct labels of up to 12 characters, or the feature stays off.
  var choices = [];
  if (Array.isArray(config.marks)) {
    config.marks.forEach(function (c) {
      if (typeof c !== "string") return;
      c = c.replace(/\s+/g, " ").trim();
      if (c && c.length <= 12 && choices.indexOf(c) < 0) choices.push(c);
    });
  }
  if (choices.length > 6) choices = [];
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { /* Storage is optional. */ }
  // Closed: the bar is folded into a small handle so it does not cover the page.
  var closed = !!(saved && saved.v === 1 && saved.closed === true);
  // Hidden by the Hide button: the bar is tucked into the pen button while editing goes on. Not saved.
  var tucked = false;

  function flat(s) { return s.replace(/[ \t\n\r\f]+/g, " "); }
  function collapses(node) { return /^(normal|nowrap)$/.test(getComputedStyle(node).whiteSpace); }
  function read(node, collapse) {
    var out = "";
    Array.prototype.forEach.call(node.childNodes, function (c) {
      out += c.nodeType === 3 ? (collapse ? flat(c.data) : c.data) : c.nodeName === "BR" ? "\n" : c.textContent;
    });
    return out.replace(/\u00a0/g, " ");
  }
  // Line breaks come from <br> only; spaces around them are layout, not wording.
  var SVG = "http://www.w3.org/2000/svg";
  function isSvg(node) { return node.namespaceURI === SVG; }
  function trimLines(s) { return s.replace(/ *\n */g, "\n").trim(); }
  function text(node) {
    return isSvg(node) ? node.textContent.replace(/\s+/g, " ").trim() : trimLines(read(node));
  }
  function write(node, text) {
    if (isSvg(node)) { node.textContent = text.replace(/\s*\n\s*/g, " "); return; }
    node.textContent = "";
    text.split("\n").forEach(function (line, i) {
      if (i) node.appendChild(document.createElement("br"));
      node.appendChild(document.createTextNode(line));
    });
  }

  // A label's edge spaces separate it from its neighbours (tspans), so only the trimmed part is replaced.
  function put(it, value) {
    if (!it.svg) write(it.node, value);
    else if (value === it.original) it.node.textContent = it.raw;
    else write(it.node, it.raw.match(/^\s*/)[0] + value + it.raw.match(/\s*$/)[0]);
  }
  // Saved and undone texts have no edge spaces; an HTML element keeps its current ones around them.
  function writeBack(it, value) {
    if (it.svg) put(it, value);
    else {
      var raw = read(it.node);
      write(it.node, raw.match(/^ */)[0] + value + raw.match(/ *$/)[0]);
    }
  }
  function isLabel(node) {
    return (node.localName === "text" || (node.localName === "tspan" && node.closest("text"))) &&
      !node.closest("defs,symbol,clipPath,mask,pattern,marker") &&
      !Array.prototype.some.call(node.childNodes, function (c) { return c.nodeType !== 3; });
  }

  // Items that take a verdict. Own text is wrapped first so that it stays an editable leaf and the buttons survive write().
  var markItems = [], markIds = [], marks = Object.create(null);
  if (choices.length) {
    Array.prototype.forEach.call(document.body.querySelectorAll("[data-fixwords-mark]"), function (node) {
      if (node.closest("#fixwords-bar, #fixwords-panel, #fixwords-handle")) return;
      var id = node.getAttribute("data-fixwords-mark").trim() || String(markItems.length + 1);
      var ownText = Array.prototype.some.call(node.childNodes, function (c) { return c.nodeType === 3 && c.data.trim(); });
      if (ownText) {
        var wrap = document.createElement("span");
        while (node.firstChild) wrap.appendChild(node.firstChild);
        node.appendChild(wrap);
      }
      var group = document.createElement("span");
      group.className = "fixwords-marks";
      group.setAttribute("role", "radiogroup"); group.setAttribute("aria-label", id); group.setAttribute("data-no-edit", "");
      var buttons = choices.map(function (choice) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
        b.textContent = choice; group.appendChild(b);
        b.addEventListener("click", function () { setMark(id, marks[id] === choice ? "" : choice); });
        return b;
      });
      node.appendChild(group);
      markItems.push({ id: id, buttons: buttons });
      if (markIds.indexOf(id) < 0) markIds.push(id);
    });
  }
  function paintMarks() {
    markItems.forEach(function (m) {
      m.buttons.forEach(function (b, i) { b.setAttribute("aria-checked", marks[m.id] === choices[i] ? "true" : "false"); });
    });
  }

  // Only an element whose children are all text is editable. Text beside other elements (a sentence around
  // a link) is wrapped first in an element of its own, so that it can be edited and the link stays a link. The
  // custom tag is inline and matches no span rule of the page. Labels, summaries and buttons are left alone:
  // a click on their text would toggle or focus something else instead of placing the caret.
  var PART = "fixwords-text";
  Array.prototype.forEach.call(document.body.querySelectorAll("*"), function (node) {
    if (node.namespaceURI !== "http://www.w3.org/1999/xhtml" || node.closest(SKIP) || node.closest("label,summary,button")) return;
    var kids = Array.prototype.slice.call(node.childNodes);
    if (!kids.some(function (c) { return c.nodeType === 1 && c.nodeName !== "BR"; })) return;
    kids.forEach(function (c) {
      if (c.nodeType !== 3 || !c.data.trim()) return;
      var wrap = document.createElement(PART);
      node.replaceChild(wrap, c); wrap.appendChild(c);
    });
  });
  var items = [];
  var headings = [];
  // Counted apart: HTML elements, SVG labels, and wrapped parts (so that parts do not shift saved older edits).
  var totals = [Object.create(null), Object.create(null), Object.create(null)];
  Array.prototype.forEach.call(document.body.querySelectorAll("*"), function (node) {
    if (/^H[1-6]$/.test(node.nodeName) && !node.closest("#fixwords-bar, #fixwords-panel")) {
      headings.push(node);
    }
    if (node.closest(SKIP)) return;
    var hasText = false, onlyText = true;
    Array.prototype.forEach.call(node.childNodes, function (c) {
      if (c.nodeType === 3) { if (c.data.trim()) hasText = true; }
      else if (c.nodeType === 1 && c.nodeName !== "BR") onlyText = false;
    });
    if (!hasText || !onlyText) return;
    var svg = isSvg(node);
    var collapse = collapses(node);
    if (svg && !isLabel(node)) return;
    // Source line wraps are not line breaks: collapse them (rendering stays the same) so that
    // they are not turned into <br> when the element is rewritten.
    if (!svg && collapse) {
      Array.prototype.forEach.call(node.childNodes, function (c) {
        if (c.nodeType !== 3) return;
        var f = flat(c.data);
        if (f !== c.data) c.data = f;
      });
    }
    var original = text(node);
    var part = node.localName === PART, kind = svg ? 1 : part ? 2 : 0;
    var counts = totals[kind];
    counts[original] = (counts[original] || 0) + 1;
    var h = headings.length - 1;
    while (h >= 0 && headings[h].contains(node)) h--;
    var heading = h >= 0 ? headings[h] : null;
    var hint = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "";
    if (hint.length > 30) hint = hint.slice(0, 30) + "…";
    items.push({ node: node, original: original, index: counts[original], heading: hint, svg: svg, part: part, kind: kind, raw: svg ? node.textContent : "" });
  });
  // Snapshot blocks before saved edits are applied, so matching and reports use source text.
  var blocks = [];
  items.forEach(function (it) {
    if (it.svg) return;
    var node = it.node.closest("tr, li, dt, dd, p, h1, h2, h3, h4, h5, h6, blockquote, figcaption, caption");
    if (!node && /^(block|list-item|table|flex|grid|flow-root)$/.test(getComputedStyle(it.node).display)) node = it.node;
    if (!node || node === document.body || node.closest(SKIP)) return;
    var block = blocks.filter(function (b) { return b.node === node; })[0];
    if (!block) {
      block = { node: node, items: [], heading: it.heading, kind: node.localName === "tr" ? "row" : /^(li|dt|dd)$/.test(node.localName) ? "item" : /^h[1-6]$/.test(node.localName) ? "heading" : "para" };
      blocks.push(block);
    }
    block.items.push(it); it.block = block;
  });
  blocks.forEach(function (b) {
    b.original = items.filter(function (it) { return b.node.contains(it.node); })
      .map(function (it) { return it.original; }).join(t("lineSeparator"));
  });
  blocks.forEach(function (b) {
    var same = blocks.filter(function (x) { return x.node.localName === b.node.localName && x.original === b.original; });
    b.index = same.indexOf(b) + 1; b.total = same.length;
    b.deleted = savedList("deletes").some(function (e) { return e && e.t === b.node.localName && e.o === b.original && e.i === b.index && e.n === b.total; });
    if (b.deleted) b.node.setAttribute("data-fixwords-deleted", "");
  });
  function suppressed(it) { return !!it.node.closest("[data-fixwords-deleted]"); }
  function covered(b) { return !!b.node.parentElement.closest("[data-fixwords-deleted]"); }
  function deletions() { return blocks.filter(function (b) { return b.deleted && !covered(b); }); }
  function inOrder(a, b) { return a.node === b.node ? 0 : a.node.compareDocumentPosition(b.node) & 2 ? 1 : -1; }
  function changeRows() { return changes().concat(deletions()).sort(inOrder); }
  function setDeleted(b, on) {
    b.deleted = on;
    if (on) b.node.setAttribute("data-fixwords-deleted", ""); else b.node.removeAttribute("data-fixwords-deleted");
    syncEditable();
  }
  // A note is a plain string per element (it.note) plus one page-level note.
  var pageNote = "";
  function cleanNote(value) {
    return typeof value === "string" ? value.replace(/\r\n?/g, "\n").replace(/ *\n */g, "\n").replace(/\n{2,}/g, "\n").trim() : "";
  }
  // Saved entries are trusted only when the version matches; each one is tied to its element by text, index and count.
  function savedList(name) { return saved && saved.v === 1 && Array.isArray(saved[name]) ? saved[name] : []; }
  function savedFor(name, it, valid) {
    var found = null;
    savedList(name).some(function (e) {
      if (e && e.o === it.original && !!e.s === it.svg && !!e.w === it.part && e.i === it.index && e.n === it.total && valid(e)) { found = e; return true; }
      return false;
    });
    return found;
  }
  items.forEach(function (it) {
    it.total = totals[it.kind][it.original];
    var n = savedFor("notes", it, function (e) { return cleanNote(e.c); });
    it.note = n ? cleanNote(n.c) : "";
    var edit = savedFor("edits", it, function (e) { return typeof e.t === "string"; });
    if (edit) writeBack(it, edit.t);
  });

  if (saved && saved.v === 1 && saved.marks && typeof saved.marks === "object" && !Array.isArray(saved.marks)) {
    markIds.forEach(function (id) {
      var value = Object.prototype.hasOwnProperty.call(saved.marks, id) ? saved.marks[id] : null;
      if (typeof value === "string" && choices.indexOf(value) >= 0) marks[id] = value;
    });
    paintMarks();
  }
  function markCount() { return Object.keys(marks).length; }

  savedList("notes").some(function (n) {
    if (n && typeof n === "object" && n.o === undefined && cleanNote(n.c)) { pageNote = cleanNote(n.c); return true; }
    return false;
  });
  function noted() { return items.filter(function (it) { return it.note && !suppressed(it); }); }
  function noteCount() { return noted().length + (pageNote ? 1 : 0); }
  function total() { return changes().length + deletions().length + noteCount() + markCount(); }
  function changes() {
    return items.filter(function (it) { return !suppressed(it) && text(it.node) !== it.original; });
  }
  function persist() {
    var changed = items.filter(function (it) { return text(it.node) !== it.original; });
    var map = { v: 1, closed: closed, edits: changed.map(function (it) {
      var edit = { o: it.original, i: it.index, n: it.total, t: text(it.node) };
      if (it.svg) edit.s = 1;
      if (it.part) edit.w = 1;
      return edit;
    }) };
    // Keep covered child deletions too, so restoring their ancestor revives their state.
    map.deletes = blocks.filter(function (b) { return b.deleted; }).map(function (b) { return { t: b.node.localName, o: b.original, i: b.index, n: b.total }; });
    var notes = items.filter(function (it) { return it.note; }).map(function (it) {
      var n = { o: it.original, i: it.index, n: it.total, c: it.note };
      if (it.svg) n.s = 1;
      if (it.part) n.w = 1;
      return n;
    });
    if (pageNote) notes.push({ c: pageNote });
    if (notes.length) map.notes = notes;
    if (markCount()) {
      map.marks = Object.create(null);
      markIds.forEach(function (id) { if (marks[id]) map.marks[id] = marks[id]; });
    }
    if (sent) map.sent = sent;
    try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) { /* private mode: edits last until reload */ }
    render();
  }
  function oneLine(s) { return s.replace(/\n/g, t("lineSeparator")); }
  function report() {
    var lines = [t("reportTitle", { title: title })];
    if (genre) lines.push(t("genre", { genre: genre }));
    var head = lines.length;
    if (choices.length && total() > 0) {
      var unmarked = markIds.filter(function (id) { return !marks[id]; });
      lines.push("", t("marksHead", { n: markIds.length - unmarked.length, total: markIds.length }));
      choices.forEach(function (choice) {
        var ids = markIds.filter(function (id) { return marks[id] === choice; });
        if (ids.length) lines.push(choice + t("separator") + ids.join(", "));
      });
      if (unmarked.length) lines.push(t("unmarked") + t("separator") + unmarked.join(", "));
    }
    function hint(it) {
      return it.total > 1 ? t("occurrence", { index: it.index, total: it.total,
        heading: it.heading ? t("heading", { heading: it.heading }) : "" }) : "";
    }
    var number = 0;
    changeRows().forEach(function (it) {
      if (it.deleted) {
        lines.push("", ++number + ". " + t("deleteLine") + hint(it) + t("separator") + oneLine(it.original));
        return;
      }
      var label = (it.svg ? t("figure") : "") + t("before") + hint(it);
      lines.push("", ++number + ". " + label + t("separator") + oneLine(it.original), t("after", { text: oneLine(text(it.node)) }));
    });
    noted().forEach(function (it) {
      lines.push("", ++number + ". " + (it.svg ? t("figure") : "") + t("commentOn", { text: oneLine(text(it.node)) }) + hint(it),
        t("noteLine", { text: oneLine(it.note) }));
    });
    if (pageNote) lines.push("", ++number + ". " + t("commentPage"), t("noteLine", { text: oneLine(pageNote) }));
    if (lines.length === head) lines.push("", t("noChanges"));
    return lines.join("\n");
  }

  function setMark(id, choice) {
    if (choice) marks[id] = choice; else delete marks[id];
    paintMarks(); hideSheet(); persist();
  }
  var sent = saved && saved.v === 1 && typeof saved.sent === "string" ? saved.sent : "";
  var destination = typeof config.send_to === "string" ? config.send_to.replace(/\s+/g, " ").trim() : "";
  if (destination.length > 60) destination = destination.slice(0, 60) + "…";
  if (destination && !/[。.!?！？]$/.test(destination)) destination += t("destinationEnd");
  var editing = false, busy = false, sheetText = "", sentMode = "copied";
  function hash(value) {
    var h = 5381;
    for (var i = 0; i < value.length; i++) h = ((h << 5) + h) ^ value.charCodeAt(i);
    return (h >>> 0).toString(36);
  }
  function unsent() { return total() > 0 && hash(report()) !== sent; }
  var css = document.createElement("style");
  css.textContent =
    "#fixwords-svg-input,#fixwords-note-input,#fixwords-bar,#fixwords-panel,#fixwords-handle{--surface:#fff;--ink:#191d22;--edge:rgba(25,29,34,.24);--accent:#0b6e66;--accent-ink:#fff;--amber:#b45309;--danger:#b42318;--muted:#535b65;box-sizing:border-box;position:fixed;right:14px;bottom:14px;z-index:2147483000;background:var(--surface);color:var(--ink);border:1px solid var(--edge);box-shadow:0 4px 24px rgba(0,0,0,.28);font:500 15px/1.5 'Hiragino Sans','Yu Gothic','Noto Sans CJK JP',sans-serif}" +
    "#fixwords-bar,#fixwords-panel{width:min(440px,calc(100vw - 28px));padding:12px;border-radius:16px;opacity:0;transform:translateY(8px);transition:opacity 200ms cubic-bezier(.23,1,.32,1),transform 200ms cubic-bezier(.23,1,.32,1)}" +
    "#fixwords-bar[data-visible],#fixwords-panel[data-visible]{opacity:1;transform:translateY(0)}" +
    "#fixwords-bar button,#fixwords-panel button,#fixwords-handle{box-sizing:border-box;min-width:44px;min-height:44px;font:inherit;border:0;border-radius:10px;background:transparent;color:inherit;padding:8px 12px;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:transform 120ms cubic-bezier(.23,1,.32,1)}" +
    "#fixwords-bar button:active,#fixwords-panel button:active,#fixwords-handle:active{transform:scale(.97)}" +
    "#fixwords-bar button:focus-visible,#fixwords-panel button:focus-visible,#fixwords-panel textarea:focus-visible,#fixwords-handle:focus-visible{outline:3px solid var(--accent);outline-offset:2px}" +
    "#fixwords-bar [hidden],#fixwords-panel [hidden],#fixwords-bar[hidden],#fixwords-panel[hidden],#fixwords-handle[hidden]{display:none!important}" +
    "#fixwords-header,#fixwords-secondary,#fixwords-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}#fixwords-header{flex-wrap:nowrap}#fixwords-hide{margin-left:auto}#fixwords-title{font-weight:600}#fixwords-header #fixwords-status{flex:1;min-width:0;margin:0;overflow-wrap:anywhere}" +
    "#fixwords-guide{margin:4px 0 12px}#fixwords-guide strong{display:block;margin-top:6px}#fixwords-status{color:var(--muted);margin:0;transition:opacity 200ms cubic-bezier(.23,1,.32,1)}" +
    "#fixwords-status[data-state=unsent]{color:var(--amber)}#fixwords-status[data-state=sent]{color:var(--accent)}#fixwords-status[data-state=unsent]:before{content:'● ';}#fixwords-status[data-state=sent]:before{content:'✓ ';}" +
    "#fixwords-bar #fixwords-send{width:100%;min-height:48px;background:var(--accent);color:var(--accent-ink);font-size:16px;font-weight:600}#fixwords-bar #fixwords-send[aria-disabled=true]{background:var(--edge);color:var(--muted)}" +
    "#fixwords-bar[data-idle]{width:auto;height:44px;padding:0;border-radius:999px}#fixwords-bar[data-idle] #fixwords-title{padding:0 12px;font-weight:500}" +
    "#fixwords-handle{width:48px;height:48px;padding:0;border-radius:50%;opacity:1;background:var(--accent);color:var(--accent-ink);font-size:20px;border-color:var(--surface)}#fixwords-bar[data-sheet]{display:none}#fixwords-badge{position:absolute;right:-6px;top:-8px;min-width:22px;padding:1px 4px;border-radius:12px;background:var(--amber);color:var(--surface);font-size:12px}" +
    "#fixwords-panel{overflow-y:auto;overscroll-behavior:contain}#fixwords-note{white-space:pre-line;overflow-wrap:anywhere}#fixwords-note[data-mode=copied]:first-line{font-size:20px;font-weight:600}" +
    "#fixwords-panel textarea{box-sizing:border-box;display:block;width:100%;font:400 16px/1.5 'Hiragino Sans','Yu Gothic','Noto Sans CJK JP',sans-serif;margin:12px 0;padding:8px;border:1px solid var(--edge);border-radius:8px;background:var(--surface);color:var(--ink);resize:vertical;overflow:auto}" +
    "#fixwords-list-top{position:sticky;top:-12px;z-index:1;margin-top:-12px;padding:12px 0 8px;background:var(--surface)}#fixwords-list-header{display:flex;align-items:center;justify-content:space-between;gap:8px}#fixwords-list-header button{margin-left:auto}#fixwords-list-title{font-weight:600;min-width:0}" +
    "#fixwords-panel .fixwords-row{border-top:1px solid var(--edge);padding:12px 0;overflow-wrap:anywhere}#fixwords-panel .fixwords-location{color:var(--muted);font-size:13px}#fixwords-panel .fixwords-text{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;overflow-wrap:anywhere;margin:6px 0}#fixwords-panel del{color:var(--muted);text-decoration:line-through}#fixwords-panel .fixwords-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}" +
    "#fixwords-panel .fixwords-row button{border:1px solid var(--edge)}#fixwords-notice{display:flex;align-items:center;justify-content:space-between;gap:8px;overflow-wrap:anywhere}#fixwords-notice-text:before{content:'✓ ';color:var(--accent);font-weight:600}#fixwords-notice-text{flex:1;min-width:0;word-break:auto-phrase;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}#fixwords-panel #fixwords-undo{flex:none;border:1px solid var(--accent);color:var(--accent)}#fixwords-panel #fixwords-list-done{width:100%;min-height:48px;margin-top:8px;background:var(--accent);color:var(--accent-ink);font-weight:600}#fixwords-panel #fixwords-reset-all{color:var(--danger)}" +
    "body.fixwords-editing [data-fixwords-editable]{outline:1px dashed #e0a200;outline-offset:3px}body.fixwords-editing [data-fixwords-editable]:focus{outline:2px solid #e0a200;background:rgba(224,162,0,.14)}body.fixwords-editing [data-fixwords-changed]{box-shadow:inset 0 -3px 0 #e0a200}body.fixwords-show-changes [data-fixwords-changed]{background:rgba(255,214,10,.55);outline:2px solid #e0a200;outline-offset:2px;color:#000}" +
    ".fixwords-marks{--surface:#fff;--ink:#191d22;--edge:rgba(25,29,34,.24);--accent:#0b6e66;--accent-ink:#fff}" +
    "@media(prefers-color-scheme:dark){#fixwords-tools,.fixwords-marks,#fixwords-svg-input,#fixwords-note-input,#fixwords-bar,#fixwords-panel,#fixwords-handle{--surface:#1f2329;--ink:#f2f4f6;--edge:rgba(242,244,246,.3);--accent:#35b3a7;--accent-ink:#191d22;--amber:#fbbf24;--danger:#f97066;--muted:#bdc4cd}}" +
    "@media(hover:hover) and (pointer:fine){#fixwords-bar button:hover,#fixwords-panel button:hover,#fixwords-handle:hover{box-shadow:inset 0 0 0 2px var(--accent)}body.fixwords-editing [data-fixwords-editable]{cursor:text}}" +
    "@media(max-width:600px){#fixwords-bar:not([data-idle]),#fixwords-panel{right:0;bottom:0;width:100%;border-radius:16px 16px 0 0;padding-bottom:max(12px,env(safe-area-inset-bottom,0px));padding-left:max(12px,env(safe-area-inset-left,0px));padding-right:max(12px,env(safe-area-inset-right,0px))}}" +
    ".fixwords-box{fill:none;stroke:#e0a200;stroke-dasharray:3 2;vector-effect:non-scaling-stroke;pointer-events:none}.fixwords-box.changed{fill:rgba(224,162,0,.16);stroke-dasharray:none}" +
    "#fixwords-svg-input{position:absolute;right:auto;bottom:auto;z-index:2147482999;font-size:16px;min-height:44px;padding:8px;border:2px solid #e0a200;border-radius:8px;margin:0}" +
    "#fixwords-note-input{display:block;position:absolute;right:auto;bottom:auto;z-index:2147482999;font-size:16px;font-weight:400;min-height:44px;padding:8px;border:2px solid #2563eb;border-radius:8px;margin:0;resize:none;overflow:auto}" +
    "[data-fixwords-noted]{text-decoration:underline dotted #2563eb 2px;text-underline-offset:4px}.fixwords-box.noted{stroke:#2563eb;stroke-dasharray:1 3;stroke-linecap:round}#fixwords-bar #fixwords-pagenote[data-noted]{box-shadow:inset 0 -3px 0 #2563eb}" +
    "#fixwords-tools{--surface:#fff;--ink:#191d22;--edge:rgba(25,29,34,.24);--accent:#0b6e66;position:absolute;z-index:2147482999;box-sizing:border-box;display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--surface);color:var(--ink);border:1px solid var(--edge);box-shadow:0 2px 12px rgba(0,0,0,.28);font:500 15px/1.5 'Hiragino Sans','Yu Gothic','Noto Sans CJK JP',sans-serif}#fixwords-tools[hidden]{display:none!important}" +
    "#fixwords-tools button{box-sizing:border-box;min-width:44px;min-height:44px;margin:0;font:inherit;border:0;border-radius:8px;background:transparent;color:inherit;padding:6px 12px;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}#fixwords-tools button:focus-visible{outline:3px solid var(--accent);outline-offset:1px}" +
    "@media(hover:hover) and (pointer:fine){#fixwords-tools button:hover{box-shadow:inset 0 0 0 2px var(--accent)}}" +
    ".fixwords-note-pin{position:absolute;z-index:2147482998;box-sizing:border-box;width:32px;height:32px;margin:0;padding:0;border:0;border-radius:50%;background:#2563eb;color:#fff;font:15px/32px sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.25);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}" +
    ".fixwords-note-pin:focus-visible{outline:3px solid #2563eb;outline-offset:2px}" +
    ".fixwords-marks{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 0;padding:0;border:0;background:none;font:500 15px/1.3 'Hiragino Sans','Yu Gothic','Noto Sans CJK JP',sans-serif;text-align:left}" +
    ".fixwords-marks button[role=radio]{box-sizing:border-box;display:inline-block;width:auto;min-width:48px;min-height:32px;margin:0;padding:4px 14px;font:inherit;line-height:1.3;letter-spacing:normal;text-transform:none;text-decoration:none;color:var(--ink);background:var(--surface);border:1px solid var(--edge);border-radius:999px;box-shadow:none;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}" +
    ".fixwords-marks button[role=radio][aria-checked=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}.fixwords-marks button[role=radio]:focus-visible{outline:3px solid var(--accent);outline-offset:2px}" +
    "@media(pointer:coarse){.fixwords-marks button[role=radio]{min-height:44px;min-width:56px}}" +
    "@media print{.fixwords-box,.fixwords-note-pin,#fixwords-tools,#fixwords-svg-input,#fixwords-note-input{display:none!important}}" +
    "@media(prefers-reduced-motion:reduce){#fixwords-bar,#fixwords-panel,#fixwords-bar button,#fixwords-panel button,#fixwords-handle,#fixwords-status{transition:none}}";
  css.textContent +=
    "[data-fixwords-deleted]{background:rgba(180,35,24,.08)!important;text-decoration:line-through;color:#727780}[data-fixwords-deleted] [data-fixwords-changed],[data-fixwords-deleted] [data-fixwords-noted]{background:transparent!important;box-shadow:none!important;outline:none!important;text-decoration:line-through;color:inherit}" +
    ".fixwords-deleted-tag{position:absolute;z-index:2147482998;min-height:32px;padding:4px 8px;border:1px solid #b42318;border-radius:8px;background:#fff1f0;color:#b42318;font:500 14px/1.5 sans-serif;cursor:pointer;touch-action:manipulation}.fixwords-deleted-tag:focus-visible{outline:3px solid #b42318;outline-offset:2px}" +
    "#fixwords-tools{max-width:calc(100vw - 16px);flex-wrap:wrap;--danger:#b42318}#fixwords-tools #fixwords-delete{color:var(--danger)}#fixwords-tools button[hidden]{display:none!important}" +
    "@media(prefers-color-scheme:dark){[data-fixwords-deleted]{background:rgba(249,112,102,.12)!important;color:#a5abb3}.fixwords-deleted-tag{background:#382321;color:#f97066;border-color:#f97066}#fixwords-tools{--danger:#f97066}}" +
    "@media print{.fixwords-deleted-tag{display:none!important}}";
  document.head.appendChild(css);
  function element(tag, id, parent, label) {
    var node = document.createElement(tag); if (id) node.id = "fixwords-" + id;
    if (label) node.textContent = label; if (parent) parent.appendChild(node); return node;
  }
  function button(label, parent, id) { var b = element("button", id, parent, label); b.type = "button"; return b; }
  var bar = element("div", "bar", document.body);
  var header = element("div", "header", bar);
  var start = button(t("startIdle"), header, "title");
  // Hide tucks the bar into the pen button and keeps editing on; the cross also ends editing.
  var hide = button(t("hide"), header, "hide");
  var close = button(t("iconClose"), header, "close"); close.setAttribute("aria-label", t("close"));
  // While the bar is open, the status takes the title's place in the header.
  var status = element("div", "status"); status.setAttribute("role", "status");
  header.insertBefore(status, hide);
  var content = element("div", "content", bar);
  var guide = element("div", "guide", content);
  element("div", "", guide, t("stepOne"));
  element("div", "", guide, destination ? t("stepDestination") + destination : t("stepTwo"));
  element("strong", "", guide, t("guide"));
  var send = button("", content, "send");
  var secondary = element("div", "secondary", content);
  var toggle = button(t("continue"), secondary);
  var reset = button(t("reset"), secondary, "reset");
  var pageBtn = button(t("pageComment"), secondary, "pagenote"); pageBtn.hidden = true;
  var tools = element("div", "tools", document.body); tools.hidden = true;
  tools.setAttribute("role", "toolbar"); tools.setAttribute("aria-label", t("toolsLabel"));
  var commentTool = button(t("comment"), tools);
  var deleteTool = button("", tools, "delete"); deleteTool.hidden = true;
  var handle = button(t("iconEdit"), document.body, "handle");
  var badge = element("span", "badge", handle); badge.setAttribute("aria-hidden", "true");
  var panel = element("div", "panel", document.body); panel.hidden = true;
  panel.setAttribute("role", "region"); panel.setAttribute("aria-label", t("sendLabel"));
  var sendView = element("div", "", panel);
  var note = element("div", "note", sendView); note.setAttribute("role", "status");
  var area = element("textarea", "", sendView); area.readOnly = true; area.rows = 5; area.setAttribute("aria-label", t("reportLabel"));
  var actions = element("div", "actions", sendView);
  var again = button(t("copyAgain"), actions);
  var share = button(t("share"), actions); try { share.hidden = typeof navigator.share !== "function"; } catch (e) { share.hidden = true; }
  var manual = button(t("manualDone"), actions); manual.hidden = true;
  var dismiss = button(t("close"), actions);
  var listView = element("div", "", panel); listView.hidden = true;
  // The title and the notice stay in view while the rows scroll under them.
  var listTop = element("div", "list-top", listView);
  var listHeader = element("div", "list-header", listTop);
  // Not an h2: the page's own heading styles would reach it.
  var listTitle = element("div", "list-title", listHeader, t("listTitle")); listTitle.tabIndex = -1;
  listTitle.setAttribute("role", "heading"); listTitle.setAttribute("aria-level", "2");
  var listClose = button(t("iconClose"), listHeader); listClose.setAttribute("aria-label", t("close"));
  // Screen readers get the notice from a live region that is always rendered while the list is open.
  var live = element("span", "", listTop); live.className = "fixwords-sr"; live.setAttribute("role", "status");
  var notice = element("div", "notice", listTop); notice.hidden = true;
  var noticeText = element("span", "notice-text", notice); noticeText.setAttribute("aria-hidden", "true");
  var undo = button(t("restore"), notice, "undo");
  var rows = element("div", "", listView);
  var resetAll = button(t("resetAll"), listView, "reset-all");
  // Shown instead of the rows once no changed text is left.
  var listDone = button(t("close"), listView, "list-done");
  var undoSlot = null, revertedAt = 0;
  var spacer = element("div", "spacer"), room = 0; spacer.setAttribute("aria-hidden", "true");
  function reveal(node) {
    if (!node.hidden && node.hasAttribute("data-visible")) return;
    node.hidden = false; node.removeAttribute("data-visible");
    void node.offsetHeight; node.setAttribute("data-visible", "");
  }
  function layout() {
    var phone = window.matchMedia("(max-width:600px)").matches;
    var open = !closed && (editing || total() > 0);
    // A tucked bar keeps its last room, so the text being edited does not jump.
    if (!bar.hidden && panel.hidden) room = bar.offsetHeight;
    if (phone && open && panel.hidden) {
      if (!spacer.parentNode) document.body.appendChild(spacer);
      spacer.style.height = room + "px";
    } else if (spacer.parentNode) spacer.parentNode.removeChild(spacer);
    panel.style.maxHeight = Math.max(80, window.innerHeight - 28) + "px";
    // A button that takes focus is scrolled clear of the pinned list top, not under it.
    panel.style.scrollPaddingTop = listView.hidden ? "" : listTop.offsetHeight + "px";
  }
  function render() {
    var e = changes().length, d = deletions().length, m = noteCount(), k = markCount(), n = e + d + m, all = n + k, pending = all && unsent(), idle = !editing && !all;
    bar.hidden = closed || tucked; handle.hidden = !bar.hidden; hide.hidden = idle;
    if (idle) bar.setAttribute("data-idle", ""); else bar.removeAttribute("data-idle");
    start.hidden = !idle; status.hidden = idle;
    content.hidden = idle; guide.hidden = !editing || all > 0; reset.hidden = !all;
    pageBtn.hidden = idle; if (pageNote) pageBtn.setAttribute("data-noted", ""); else pageBtn.removeAttribute("data-noted");
    toggle.textContent = editing ? t("stop") : t("continue");
    toggle.setAttribute("aria-pressed", editing ? "true" : "false");
    if (choices.length || d) {
      var v = { k: k, all: markIds.length, n: e, d: d, m: m };
      var stats = choices.length ? [t("statMarks", v)] : [];
      if (e) stats.push(t("statEdits", v));
      if (d) stats.push(t("statDeletes", v));
      if (m) stats.push(t("statNotes", v));
      stats = stats.join(t("statJoin"));
      status.textContent = !all ? t("empty") : stats + t(pending ? "tailPending" : sentMode === "shared" ? "tailShared" : "tailCopied");
      send.textContent = t(choices.length ? "sendMarks" : "sendStats", { parts: stats });
    } else {
      var sentKey = (sentMode === "shared" ? "sharedStatus" : "copiedStatus") + (m ? "Notes" : "");
      status.textContent = !n ? t("empty") : pending ? t(m ? "pendingNotes" : "pending", { n: e, m: m }) : t(sentKey, { n: e, m: m });
      send.textContent = m ? t("sendCountNotes", { n: e, m: m }) : t("sendCount", { n: n });
    }
    status.setAttribute("data-state", !all ? "empty" : pending ? "unsent" : "sent");
    send.setAttribute("aria-disabled", !all ? "true" : "false");
    badge.hidden = !pending; badge.textContent = all;
    handle.setAttribute("aria-label", t("open") + (pending ? t("unsent", { n: all }) : ""));
    if (!bar.hidden) reveal(bar); else bar.removeAttribute("data-visible");
    layout();
  }
  // The box exists while editing, or while the label is changed; it is rebuilt on every call
  // because its size follows the label's current text and layout.
  function markSvg(it, changed, noted) {
    if (it.box) { it.box.remove(); it.box = null; }
    if (suppressed(it) || (!editing && !changed && !noted)) return;
    try {
      var b = it.node.getBBox();
      var anchor = it.node.localName === "text" ? it.node : it.node.closest("text");
      // No box for a label that is not rendered, or that a CSS transform moves away from its bounding box.
      if (![b.x, b.y, b.width, b.height].every(isFinite) || (!b.width && !b.height) ||
          (!anchor.hasAttribute("transform") && getComputedStyle(anchor).transform !== "none")) return;
      var box = document.createElementNS(SVG, "rect");
      box.setAttribute("class", "fixwords-box" + (changed ? " changed" : "") + (noted ? " noted" : ""));
      box.setAttribute("x", b.x - 4); box.setAttribute("y", b.y - 2);
      box.setAttribute("width", Math.max(24, b.width + 8)); box.setAttribute("height", Math.max(12, b.height + 4));
      box.setAttribute("rx", "3");
      if (anchor.hasAttribute("transform")) box.setAttribute("transform", anchor.getAttribute("transform"));
      anchor.parentNode.insertBefore(box, anchor); it.box = box;
    } catch (e) { /* getBBox can throw for a label that is not rendered. */ }
  }
  function mark() {
    updateTools();
    items.forEach(function (it) {
      var changed = text(it.node) !== it.original;
      if (it.svg) markSvg(it, changed, !!it.note);
      if (it.note) it.node.setAttribute("data-fixwords-noted", "");
      else it.node.removeAttribute("data-fixwords-noted");
      if (changed) it.node.setAttribute("data-fixwords-changed", "");
      else it.node.removeAttribute("data-fixwords-changed");
    });
    placePins();
  }
  // A 💬 pin just after the last character of each commented text opens its comment, in any mode.
  // It lives in the body, not in the page text, so the text and the report stay as they are.
  function placePins() {
    placeDeletedTags();
    // Three passes, so a page with many comments lays out once: DOM writes, then all reads, then the positions.
    var pinned = items.filter(function (it) {
      if (!it.note || closed || suppressed(it)) { if (it.pin) { it.pin.remove(); it.pin = null; } return false; }
      if (!it.pin) {
        it.pin = button("💬", document.body); it.pin.className = "fixwords-note-pin";
        it.pin.addEventListener("click", function () { openNote({ item: it }); });
      }
      it.pin.setAttribute("aria-label", t("notePin", { text: cut(oneLine(text(it.node)), 20) }));
      it.pin.hidden = false;
      return true;
    });
    if (!pinned.length) return;
    // Where left/top 0 puts a pin: its containing block depends on the page's own layout, and all pins share it.
    pinned[0].pin.style.left = pinned[0].pin.style.top = "0px";
    var zero = pinned[0].pin.getBoundingClientRect(), viewport = document.documentElement.clientWidth;
    var ends = pinned.map(function (it) {
      if (it.svg) return it.node.getBoundingClientRect();
      var range = document.createRange(); range.selectNodeContents(it.node);
      var rects = range.getClientRects(); return rects[rects.length - 1] || null;
    });
    pinned.forEach(function (it, i) {
      var end = ends[i], size = 32;
      it.pin.hidden = !end || (!end.width && !end.height);
      if (it.pin.hidden) return;
      // With no room left on the line, the pin overlaps the end of the text instead of widening the page.
      var left = Math.max(0, Math.min(end.right + (it.svg ? 4 : 2), viewport - size - 4));
      it.pin.style.left = left - zero.left + "px";
      it.pin.style.top = end.top + end.height / 2 - size / 2 - zero.top + "px";
    });
  }

  function placeDeletedTags() {
    var tagged = blocks.filter(function (b) {
      if (!b.deleted || covered(b) || closed) { if (b.tag) { b.tag.remove(); b.tag = null; } return false; }
      if (!b.tag) {
        b.tag = button(t("deletedTag"), document.body); b.tag.className = "fixwords-deleted-tag";
        b.tag.addEventListener("click", function () {
          setDeleted(b, false); persist(); mark();
          if (editing) b.items[0].node.focus(); else (start.hidden ? toggle : start).focus();
        });
      }
      b.tag.style.left = b.tag.style.top = "0px";
      return true;
    });
    // As with pins, finish writes before measuring and positioning the tags.
    var viewport = document.documentElement.clientWidth;
    var rects = tagged.map(function (b) {
      return { zero: b.tag.getBoundingClientRect(), node: b.node.getBoundingClientRect() };
    });
    tagged.forEach(function (b, i) {
      var zero = rects[i].zero, r = rects[i].node;
      b.tag.style.left = Math.max(0, Math.min(r.left, viewport - zero.width)) - zero.left + "px";
      b.tag.style.top = r.top - zero.height / 2 - zero.top + "px";
    });
  }
  var svgInput = null, svgItem = null;
  // Safari ends the composition before the Enter that confirmed it; that keydown carries keyCode 229.
  function composing(e) { return e.isComposing || e.keyCode === 229; }
  // Position a floating field next to a node: centred on it ("center"), or just below it, above if that does not
  // fit ("below"). A "below" field stays above floor (the top of the bar), else it would open hidden under it.
  function place(box, node, width, where, floor) {
    var r = node.getBoundingClientRect();
    var viewport = document.documentElement.clientWidth;
    width = Math.max(0, Math.min(width, viewport - 16));
    box.style.width = width + "px";
    // Measure where left/top 0 puts the field: its containing block depends on the page's own layout.
    box.style.left = box.style.top = "0px";
    var zero = box.getBoundingClientRect();
    var left = Math.max(8, Math.min(r.left + (r.width - width) / 2, viewport - width - 8));
    var top = r.top + (r.height - zero.height) / 2;
    if (where === "below") {
      floor = Math.min(floor, window.innerHeight) - 8;
      top = r.bottom + 6;
      if (top + zero.height > floor) top = r.top - zero.height - 6;
      if (top < 8) top = Math.max(8, floor - zero.height);
    }
    box.style.left = left - zero.left + "px";
    box.style.top = top - zero.top + "px";
  }
  function placeSvg() {
    if (!svgInput) return;
    place(svgInput, svgItem.node, Math.max(svgInput.value.length * 16.5 + 44, svgItem.node.getBoundingClientRect().width + 44, 220), "center");
  }
  function finishSvg(cancel, focus) {
    if (!svgInput) return;
    var input = svgInput, it = svgItem;
    var value = input.value.replace(/\s*\n\s*/g, " ").trim();
    svgInput = null; svgItem = null;
    if (toolItem === it) hideTools();
    input.remove();
    if (!cancel && value && value !== text(it.node)) put(it, value);
    hideSheet(); persist(); mark();
    if (focus) it.node.focus();
  }
  function openSvg(it) {
    // Opening a label closes the sheet, as an edit on the page does.
    finishSvg(false, false); hideSheet();
    svgItem = it; svgInput = element("input", "svg-input", document.body);
    svgInput.type = "text"; svgInput.setAttribute("aria-label", t("svgLabel"));
    svgInput.value = text(it.node);
    svgInput.addEventListener("input", placeSvg);
    svgInput.addEventListener("blur", function (e) {
      if (e.relatedTarget && tools.contains(e.relatedTarget)) return;
      finishSvg(false, false);
    });
    svgInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !composing(e)) { e.preventDefault(); finishSvg(false, true); }
      else if (e.key === "Escape" && !composing(e)) { e.preventDefault(); e.stopPropagation(); finishSvg(true, true); }
    });
    placeSvg(); showTools(it);
    svgInput.focus(); svgInput.select();
  }
  // The comment field: one textarea for an element (target.item) or for the whole page (target.page).
  var noteInput = null, noteTarget = null;
  function placeNote() {
    if (!noteInput) return;
    // The page comment opens above the bar, whose button started it.
    var node = noteTarget.page ? bar : noteTarget.item.node;
    var floor = bar.hidden ? window.innerHeight : bar.getBoundingClientRect().top;
    place(noteInput, node, Math.max(280, node.getBoundingClientRect().width), "below", floor);
  }
  function finishNote(cancel, focus) {
    if (!noteInput) return;
    var input = noteInput, target = noteTarget;
    var value = cleanNote(input.value);
    noteInput = null; noteTarget = null;
    input.remove();
    if (!cancel) { if (target.page) pageNote = value; else target.item.note = value; }
    hideSheet(); persist(); mark();
    // While editing, focus goes back to the text (and its toolbar); otherwise to the pin that opened the note.
    if (focus) (target.page ? pageBtn : editing || !target.item.pin || target.item.pin.hidden ? target.item.node : target.item.pin).focus();
  }
  function openNote(target) {
    finishNote(false, false); hideSheet();
    noteTarget = target; noteInput = element("textarea", "note-input", document.body);
    noteInput.rows = 3; noteInput.setAttribute("aria-label", t("noteLabel"));
    noteInput.value = target.page ? pageNote : target.item.note;
    noteInput.addEventListener("blur", function () { finishNote(false, false); });
    noteInput.addEventListener("keydown", function (e) {
      // Plain Enter stays a newline (it also confirms IME text); Ctrl/Cmd+Enter saves.
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !composing(e)) { e.preventDefault(); finishNote(false, true); }
      else if (e.key === "Escape" && !composing(e)) { e.preventDefault(); e.stopPropagation(); finishNote(true, true); }
    });
    placeNote(); noteInput.focus();
    if (noteInput) noteInput.setSelectionRange(noteInput.value.length, noteInput.value.length);
  }
  items.forEach(function (it) {
    if (!it.svg) return;
    it.node.addEventListener("click", function () { if (editing) openSvg(it); });
    it.node.addEventListener("keydown", function (e) {
      if (editing && (e.key === " " || (e.key === "Enter" && !composing(e)))) { e.preventDefault(); openSvg(it); }
    });
  });
  // The toolbar floats just above the text being edited (below it when there is no room above) and never under the bar.
  var toolItem = null;
  function toolNode() { return svgInput && svgItem === toolItem ? svgInput : toolItem.node; }
  function placeTools() {
    if (!toolItem || tools.hidden) return;
    var r = toolNode().getBoundingClientRect(), viewport = document.documentElement.clientWidth;
    tools.style.left = tools.style.top = "0px";
    var zero = tools.getBoundingClientRect(), w = zero.width, h = zero.height;
    var floor = (bar.hidden ? window.innerHeight : Math.min(bar.getBoundingClientRect().top, window.innerHeight)) - 8;
    var left = Math.max(8, Math.min(r.right - w, viewport - w - 8));
    var top = r.top - h - 6;
    if (top < 8) top = r.bottom + 6;
    if (top + h > floor) top = Math.max(8, Math.min(r.top - h - 6, floor - h));
    if (top < 8 || top + h > floor) top = 8;
    tools.style.left = left - zero.left + "px";
    tools.style.top = top - zero.top + "px";
  }
  function updateTools() {
    if (!toolItem || tools.hidden) return;
    commentTool.textContent = t(toolItem.note ? "commentEdit" : "comment");
    deleteTool.hidden = !toolItem.block;
    if (toolItem.block) deleteTool.textContent = t("delete" + toolItem.block.kind.charAt(0).toUpperCase() + toolItem.block.kind.slice(1));
    placeTools();
  }
  function showTools(it) {
    if (suppressed(it)) return hideTools();
    toolItem = it; tools.hidden = false;
    updateTools();
  }
  function hideTools() { toolItem = null; tools.hidden = true; }
  tools.addEventListener("mousedown", function (e) { e.preventDefault(); });
  commentTool.addEventListener("click", function () {
    var it = toolItem;
    if (!it) return;
    if (svgInput && svgItem === it) finishSvg(false, false);
    openNote({ item: it });
  });
  deleteTool.addEventListener("click", function () {
    if (!toolItem || !toolItem.block) return;
    var b = toolItem.block;
    finishNote(false, false); hideTools(); setDeleted(b, true); hideSheet(); persist(); mark();
    if (b.tag) b.tag.focus();
  });
  function backToText() { toolNode().focus(); }
  tools.addEventListener("keydown", function (e) {
    if (!toolItem || composing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    var buttons = [commentTool, deleteTool].filter(function (b) { return !b.hidden; });
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); backToText(); }
    else if (e.key === "Tab" && e.shiftKey && e.target === buttons[0]) { e.preventDefault(); backToText(); }
    else if (e.key === "Tab" && !e.shiftKey && e.target === buttons[buttons.length - 1]) {
      e.preventDefault();
      var next = items.slice(items.indexOf(toolItem) + 1).filter(function (it) { return !suppressed(it); })[0];
      (next ? next.node : send).focus();
    }
  });
  tools.addEventListener("focusout", function (e) {
    // Leaving the toolbar for anything but the label's field ends the label edit.
    if (svgInput && e.relatedTarget !== svgInput && !(e.relatedTarget && tools.contains(e.relatedTarget))) finishSvg(false, false);
  });
  document.addEventListener("focusout", function (e) {
    // Static page text can leave focus on body without dispatching focusin. When focus moves to another element,
    // focusin handles it; activeElement is still body in a microtask here, so wait a task before checking.
    if (e.relatedTarget) return;
    setTimeout(function () {
      if (!toolItem) return;
      var el = document.activeElement;
      if (el === toolNode() || tools.contains(el)) return;
      if (noteInput && el === noteInput && noteTarget.item === toolItem) return;
      hideTools();
    });
  });
  document.addEventListener("focusin", function (e) {
    var el = e.target;
    if (!editing || !panel.hidden) { hideTools(); return; }
    if (tools.contains(el) || (svgInput && el === svgInput)) return;
    if (noteInput && el === noteInput && toolItem && noteTarget.item === toolItem) return;
    var it = items.filter(function (x) { return !x.svg && x.node === el; })[0];
    if (it) showTools(it); else hideTools();
  });
  document.addEventListener("keydown", function (e) {
    // Tab leaves the text for its toolbar, and comes back through it.
    if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || composing(e) || !toolItem || tools.hidden) return;
    if (e.target !== toolNode()) return;
    e.preventDefault(); commentTool.focus();
  });
  var toolFrame = 0;
  window.addEventListener("scroll", function () {
    if (!toolItem || toolFrame) return;
    toolFrame = window.requestAnimationFrame(function () { toolFrame = 0; placeTools(); });
  }, { passive: true });
  function setEditing(on) {
    if (!on) { finishSvg(false, false); finishNote(false, false); hideTools(); }
    editing = on;
    document.body.classList.toggle("fixwords-editing", on);
    syncEditable();
    mark(); render();
  }
  function syncEditable() {
    var on = editing;
    items.forEach(function (it) {
      // Capture the page's attributes before a saved deletion can strip them, even before editing.
      if (it.svg && !it.own) it.own = { tabindex: it.node.getAttribute("tabindex"), role: it.node.getAttribute("role") };
      var deleted = suppressed(it);
      if (deleted) {
        if (!it.deletedAttrs) it.deletedAttrs = { tabindex: it.node.getAttribute("tabindex") };
        it.node.removeAttribute("tabindex");
      } else if (it.deletedAttrs) {
        if (it.deletedAttrs.tabindex != null) it.node.setAttribute("tabindex", it.deletedAttrs.tabindex);
        it.deletedAttrs = null;
      }
      // SVG labels are not contenteditable; they open the floating input instead.
      var attrs = it.svg ? { tabindex: "0", role: "button" } : { contenteditable: "plaintext-only" };
      attrs["data-fixwords-editable"] = "";
      // The page's own tabindex and role on a label come back when editing ends.
      Object.keys(attrs).forEach(function (name) {
        if (on && !deleted) it.node.setAttribute(name, attrs[name]);
        else if (it.own && it.own[name] != null && !(deleted && name === "tabindex")) it.node.setAttribute(name, it.own[name]);
        else it.node.removeAttribute(name);
      });
    });
  }
  function locationLabel(it) {
    var parts = [];
    if (it.svg) parts.push(t("locFigure"));
    if (it.heading) parts.push(t("locHeading", { heading: it.heading }));
    if (it.total > 1) parts.push(t("locOccurrence", { index: it.index, total: it.total }));
    return parts.join(t("locJoin"));
  }
  function cut(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n);
    return (/[\ud800-\udbff]$/.test(s) ? s.slice(0, -1) : s) + "…";
  }
  function setUndo(slot) {
    undoSlot = slot;
    notice.hidden = !slot;
    noticeText.textContent = live.textContent = slot ? t("revertedAt", { where: locationLabel(slot.item) || t("revertedOne") }) : "";
  }
  // focusAt: the row whose button takes focus (the next one after a revert); none on opening.
  function rebuildList(focusAt) {
    rows.textContent = "";
    var changed = changeRows(), buttons = [];
    resetAll.hidden = !total();
    listDone.hidden = !!changed.length;
    // With no rows left, the question has nothing to choose from.
    listTitle.hidden = !changed.length;
    changed.forEach(function (it, i) {
      var row = element("div", "", rows); row.className = "fixwords-row";
      var loc = locationLabel(it);
      if (loc) element("div", "", row, loc).className = "fixwords-location";
      element("span", "", row, t("was")).className = "fixwords-sr";
      element("del", "", row, oneLine(it.original)).className = "fixwords-text";
      var current = it.deleted ? "" : oneLine(text(it.node));
      if (!it.deleted) {
        element("span", "", row, t("now")).className = "fixwords-sr";
        element("div", "", row, current || t("emptied")).className = "fixwords-text";
      }
      var revert = button(t("rowUndo"), row);
      revert.setAttribute("aria-label", t(it.deleted || current ? "rowLabel" : "rowLabelEmpty", {
        text: cut(current || oneLine(it.original), 20), where: loc ? t("whereWrap", { where: loc }) : "" }));
      revert.addEventListener("click", function () {
        // The next row moves under the pointer: a double click must not revert it too.
        if (Date.now() - revertedAt < 500) return;
        revertedAt = Date.now();
        setUndo({ item: it, text: text(it.node), deleted: !!it.deleted });
        if (it.deleted) setDeleted(it, false); else writeBack(it, it.original);
        persist(); mark(); rebuildList(i);
      });
      buttons.push(revert);
    });
    if (focusAt == null) (changed.length ? listTitle : listDone).focus({ preventScroll: true });
    else (buttons[Math.min(focusAt, buttons.length - 1)] || (undoSlot ? undo : listDone)).focus();
  }
  function showList() { revertedAt = 0; openPanel(listView, t("listLabel")); rebuildList(); }
  listClose.addEventListener("click", function () { hideSheet(true); });
  listDone.addEventListener("click", function () { hideSheet(true); });
  undo.addEventListener("click", function () {
    var slot = undoSlot;
    if (!slot) return;
    revertedAt = 0; setUndo(null);
    if (slot.deleted) setDeleted(slot.item, true); else writeBack(slot.item, slot.text);
    persist(); mark(); rebuildList(changeRows().indexOf(slot.item));
  });
  function hideSheet(restoreFocus) {
    var wasOpen = !panel.hidden, wasList = !listView.hidden;
    setUndo(null);
    bar.removeAttribute("data-sheet"); panel.hidden = true; panel.removeAttribute("data-visible");
    document.body.classList.remove("fixwords-show-changes"); render();
    // The title is hidden while the bar is open, so the fallback is the visible start/finish button.
    if (wasOpen && restoreFocus === true) (bar.hidden ? handle : wasList ? (!reset.hidden ? reset : start.hidden ? toggle : start) : send).focus();
  }
  function openPanel(view, label) {
    setUndo(null);
    sendView.hidden = view !== sendView; listView.hidden = view !== listView;
    panel.setAttribute("aria-label", label);
    bar.setAttribute("data-sheet", ""); reveal(panel);
    document.body.classList.add("fixwords-show-changes"); hideTools(); mark(); layout();
  }
  function showSheet(value) {
    sheetText = value; area.value = value; openPanel(sendView, t("sendLabel"));
    var changed = changeRows();
    if (changed.length) changed[0].node.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
  }
  // A share or copy can settle after the user edited again or folded the bar; its sheet must not open then.
  function stale(value) { return closed || tucked || report() !== value; }
  function result(value, mode) {
    busy = false;
    // Record the hand-off even when stale: the hash only matches if the text comes back to this exact report.
    if (mode === "copied" || mode === "shared") { sent = hash(value); sentMode = mode; persist(); }
    if (stale(value)) { render(); return; }
    note.setAttribute("data-mode", mode);
    var where = t("where");
    var paste = destination ? t("paste") + destination : where;
    note.textContent = mode === "shared" ? t("sharedNote") + (destination || where) :
      mode === "copied" ? t("copiedNote", { paste: paste }) :
      mode === "offer" ? t("cancelled") :
      t("manualNote", { paste: paste });
    manual.hidden = mode !== "manual";
    again.textContent = mode === "copied" ? t("copyAgain") : t("copy");
    showSheet(value); render();
    if (mode === "manual") pick();
    else again.focus();
  }
  // iOS Safari ignores select() on a read-only textarea; the explicit range works there too.
  function pick() { area.focus(); area.select(); try { area.setSelectionRange(0, area.value.length); } catch (e) { /* select() already ran */ } }
  function copyFallback(value) {
    // Legacy copy needs a visible, selected textarea, including after an async rejection.
    if (stale(value)) { busy = false; render(); return; }
    showSheet(value); pick();
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (e) { /* Offer manual copy. */ }
    result(value, copied ? "copied" : "manual");
  }
  function copyReport(value) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(value).then(function () { result(value, "copied"); }, function () { copyFallback(value); });
      } else copyFallback(value);
    } catch (e) { copyFallback(value); }
  }
  function shareReport(value) {
    try {
      if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ text: value }))) {
        navigator.share({ title: title, text: value }).then(function () { result(value, "shared"); }, function (e) {
          if (e && e.name === "AbortError") result(value, "offer"); else copyReport(value);
        });
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") { result(value, "offer"); return; } }
    copyReport(value);
  }
  start.addEventListener("click", function () {
    if (editing) return;
    setEditing(true);
    // The title hides itself; keep keyboard focus on a visible button.
    if (start.hidden) toggle.focus();
  });
  toggle.addEventListener("click", function () {
    setEditing(!editing);
    if (!toggle.offsetParent && !start.hidden) start.focus();
  });
  pageBtn.addEventListener("click", function () { openNote({ page: true }); });
  document.addEventListener("input", function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute("data-fixwords-editable")) { hideSheet(); persist(); mark(); }
  });
  document.addEventListener("focusout", function (e) {
    var it = items.filter(function (x) { return x.node === e.target; })[0];
    if (it && !it.svg && document.body.classList.contains("fixwords-editing")) { write(it.node, read(it.node).replace(/\n+$/, "")); persist(); mark(); }
  });
  // Links and buttons must not fire while their label is being edited.
  document.addEventListener("click", function (e) {
    if (document.body.classList.contains("fixwords-editing") && e.target.closest("[data-fixwords-editable]") && e.target.closest("a,button")) e.preventDefault();
  }, true);
  send.addEventListener("click", function () {
    finishSvg(false, false); finishNote(false, false);
    if (!total()) { status.style.opacity = ".25"; window.setTimeout(function () { status.style.opacity = "1"; }, 180); return; }
    if (busy) return; busy = true; render();
    // Desktop browsers also expose Web Share, but a copy is what people there expect; the sheet still offers sharing.
    (window.matchMedia("(pointer:coarse)").matches ? shareReport : copyReport)(report());
  });
  again.addEventListener("click", function () { if (stale(sheetText)) hideSheet(true); else if (!busy) { busy = true; copyReport(sheetText); } });
  share.addEventListener("click", function () { if (stale(sheetText)) hideSheet(true); else if (!busy) { busy = true; shareReport(sheetText); } });
  manual.addEventListener("click", function () { if (stale(sheetText)) hideSheet(true); else result(sheetText, "copied"); });
  dismiss.addEventListener("click", function () { hideSheet(true); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || composing(e)) return;
    if (!panel.hidden) { e.preventDefault(); hideSheet(true); }
  });
  function setClosed(on) {
    closed = on; tucked = false;
    if (on) { setEditing(false); hideSheet(); }
    placePins(); persist();
  }
  close.addEventListener("click", function () { setClosed(true); });
  hide.addEventListener("click", function () { tucked = true; hideSheet(); handle.focus(); });
  handle.addEventListener("click", function () {
    if (!tucked) return setClosed(false);
    tucked = false; render(); hide.focus();
  });
  reset.addEventListener("pointerdown", function () { finishSvg(true, false); finishNote(true, false); });
  reset.addEventListener("click", function () {
    finishSvg(true, false); finishNote(true, false);
    if (total()) showList();
  });
  resetAll.addEventListener("click", function () {
    if (!total() || !window.confirm(t(choices.length ? "confirmMarks" : "confirm"))) return;
    items.forEach(function (it) { writeBack(it, it.original); it.note = ""; });
    blocks.forEach(function (b) { setDeleted(b, false); });
    pageNote = ""; marks = Object.create(null); paintMarks();
    sent = ""; hideSheet(true); persist(); mark();
  });
  window.addEventListener("beforeunload", function (e) { if (unsent()) { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("resize", function () { layout(); placeSvg(); placeNote(); placeTools(); placePins(); });
  window.addEventListener("load", placePins);
  if (typeof ResizeObserver !== "undefined") { new ResizeObserver(layout).observe(bar); new ResizeObserver(placePins).observe(document.body); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePins);
  setEditing(false);
  setClosed(closed);
  }
  // Wait for the whole page: a script tag in the middle of the body must still see the content after it.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
