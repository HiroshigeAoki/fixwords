# fixwords

[日本語](README.ja.md)

Let the people you shared a page with fix its wording themselves.

You made a mockup or a draft page (perhaps with an AI coding agent) and sent it to colleagues who do not write
code. They spot wording they would change. With fixwords on the page they rewrite the text right where they see
it, press one button, and paste the result into a chat or an email to you:

```
The little bakery — Wording changes

1. Before: Warm bread for a slower morning.
   After: Warm bread for a slow morning.

2. (figure) Before: Bake the loaf
   After: Bake the bread
```

You apply the list to the source yourself, or paste it to your agent.

- One script file, no dependencies, no build step, no server. Nothing is sent anywhere by the script.
- Works on plain static HTML, including text labels inside inline SVG figures.
- English and Japanese interface, chosen from the page's language.

## Add it to a page

Copy [`fixwords.js`](fixwords.js) from this repository, put it next to your HTML file and add one line before
`</body>`:

```html
<script src="fixwords.js"></script>
```

That is all. Open the page and a "Fix wording" bar appears at the bottom. To try it first, open
[`examples/demo.html`](examples/demo.html) from a copy of this repository; it works straight from the file, with
no server.

Working with a coding agent? Ask it:

> Add fixwords to this page: copy fixwords.js next to the HTML file and load it with a script tag before `</body>`.

## What the reader does

1. Press **Fix wording**.
2. Tap any text and rewrite it. Changed text is highlighted.
   If the panel covers the text, press **Hide**: editing goes on and only the ✎ button stays in the corner. Tap ✎ to
   bring the panel back.
3. To ask a question or leave a remark instead of rewriting, press **💬 Comment**, tap the text and write it
   (Ctrl/Cmd+Enter or tapping elsewhere saves). **Comment on the whole page** adds a note that belongs to no text.
   Commented text gets a dotted underline.
4. To take back a change, press **Reset changes**. It opens a list of the changed texts; **Undo** on a row reverts
   just that text, and **Restore** in the notice brings the last one back until the list is closed. **Undo all**
   reverts every change and deletes every comment after a confirmation. To remove a comment, empty its box.
5. Press **Send your changes**. On a touch device (phone, tablet) the share sheet opens; on a computer the list
   is copied to the clipboard. Paste it into a chat or an email to the author.

The list looks like this. Comments come after the edits:

```
Spring menu draft — Wording changes

1. Before: Warm bread for slow mornings.
   After: Warm bread for a slow morning.

2. Comment on: Open from 7 am
   Note: Same on holidays?

3. Comment (whole page)
   Note: Shorter overall would be fine.
```

Edits and comments are kept in that browser (localStorage) until they are reset, so the reader can close the page and come
back. They are not shared with anyone until the reader sends the list.

## Settings (optional)

Add a meta tag with JSON. Every key is optional.

```html
<meta name="fixwords" content='{"title": "Spring menu draft", "send_to": "Send it to Sam on chat", "skip": ".legal, nav", "lang": "en"}'>
```

| Key | Meaning |
|---|---|
| `title` | Title line of the list. Default: the page title. |
| `send_to` | A short instruction (up to 60 characters) shown after copying or sharing, telling the reader where to send the list. |
| `skip` | CSS selector for parts that must not be edited. |
| `genre` | Free text (up to 40 characters, such as `Product page`). Adds a `Type: ...` line under the title of the list. |
| `lang` | `"en"` or `"ja"`. Default: Japanese when the page's `<html lang>` starts with `ja`, English for any other `lang`; a page with no `lang` follows the browser language. |

You can also mark a part as not editable in the HTML with the `data-no-edit` attribute.

## Verdicts (optional)

To have the reader give each item one of a few verdicts instead of writing about it, list the choices under
`marks` and tag each item with `data-fixwords-mark` and an id:

```html
<meta name="fixwords" content='{"marks": ["OK", "NG", "Exception"]}'>
<li data-fixwords-mark="12">Item twelve</li>
```

- Each tagged item gets a row of buttons, shown all the time. Tapping a choice selects it; tapping it again clears it.
- 1 to 6 choices, each up to 12 characters. Any other value turns verdicts off.
- Put the attribute on an element that can hold a row of buttons, such as `li`, `div`, `p` or `td`, not on a `tr`.
- An empty id becomes the item's position among the tagged items (1, 2, …). Items with the same id share one verdict, so give ids to all items or to none.
- Verdicts are kept in the browser with the edits and comments. They come first in the list, grouped by choice, with
  the items not yet marked last:

```
Acceptance check — Wording changes

Verdicts (3 of 5)
OK: 1, 4
NG: 2
Unmarked: 3, 5
```

The item's own text stays editable and commentable. **Undo all** also clears the verdicts.

## Pages with a strict Content-Security-Policy, or a single file

If the page has a CSP that blocks the script tag, or you want one self-contained HTML file to send as an
attachment, use the command. It needs Python 3 and nothing else.

```sh
python3 fixwords.py inject page.html -o page-with-fixwords.html
```

It inlines the script before `</body>` and adds the script's `sha256` hash to the page's CSP meta tag. Running it
again after updating `fixwords.js` replaces the earlier copy.

```sh
python3 fixwords.py inject site/ -o out/     # a folder: only pages with <meta name="fixwords">, or --all
python3 fixwords.py inject page.html --in-place
python3 fixwords.py inject site/ --check     # write nothing; exit 1 if a page would change
python3 fixwords.py hash                     # the hash, if your CSP is sent as an HTTP header
```

`--script FILE` uses another copy of the script; the default is the `fixwords.js` next to `fixwords.py`.

The script adds its own `<style>` element, so a policy that forbids inline styles will leave the bar unstyled.

## Learn from the fixes you receive

Save a received report as `report.txt`, then run these commands (Python 3, stdlib only):

```sh
python3 fixwords.py log report.txt             # or: log - < report.txt
python3 fixwords.py log report.txt --genre guide --doc 'Garden leaflet'
python3 fixwords.py learn
python3 fixwords.py stats
```

The log and generated files live in `~/.local/share/fixwords/`, or `$FIXWORDS_HOME` when nonempty.
The directory is private (0700), files are 0600, and writes use atomic replacement. Nothing is sent
anywhere. Japanese and English reports, including comments, are supported. Logging the same report
again adds nothing. `--doc` overrides its title; `--genre` overrides its optional Type/種類 line.

`learn` produces three files, overwriting the previous generated versions:

- `prh.yml`: literal word preferences seen at least three times across at least two documents.
- `candidates.md`: other pairs, their counts and context, with commands to accept or reject each.
- `digest.md`: evidence by genre for deletions, shortenings, comments (questions marked), and repeated
  unpromoted pairs. Each evidence section is limited to 40 entries, fenced as untrusted reader feedback; quoted texts are capped at 200 characters.

For example, invented garden leaflets might repeatedly change `utilize` to `use`. One edit stays a
candidate. Three edits across two documents promote it. You can decide sooner:

```sh
python3 fixwords.py accept utilize use
python3 fixwords.py reject utilize use
```

Either command regenerates the outputs; the latest decision wins. Punctuation-only changes, pure
insertions, and patterns that would also match the corrected text never enter the dictionary, even
when accepted. Single-character and pure hiragana patterns of at most two characters are also excluded.
Ineligible pairs are hidden from candidates; accept/reject explains the reason and exits with status 1.
Latin-only patterns use word boundaries. Use two shell-quoted arguments when either text contains `=`;
the single `B=A` form still works with exactly one `=`. Word pairs use character diffs widened to
script runs, not a morphological dictionary: kanji keeps following hiragana, and a shared leading
kanji run stays as context only if the remaining before text starts with a non-kanji character. Thus `確認を行う` → `確認する` yields `を行う` → `する`.
Review candidates before accepting them: context can change which wording fits.

Point an existing textlint prh dictionary at the generated file with `imports:` (paths are relative
to the importing dictionary; adjust this example to your location):

```yaml
imports:
  - /absolute/path/to/fixwords/prh.yml
```

Enable the prh rule in your textlint configuration. Run `learn` first so the imported file exists.
Give `digest.md` to an LLM with: “Summarize this evidence into style-guide.md, grouped by genre;
quote counts and do not invent rules.” Save the result beside the digest, review and trim it, then
add a pointer in your agent's AGENTS.md or CLAUDE.md:

> Read ~/.local/share/fixwords/style-guide.md before writing.

Adjust that path if you use `FIXWORDS_HOME`. The tool makes no LLM call and does not overwrite your
reviewed guide. Regenerate the guide when enough new evidence has accumulated.

`stats` shows monthly report batches (distinct document + timestamp), edits and comments per report,
and a repeat rate: the share of non-punctuation hunks whose pair was already promoted by the end of
the previous month, using historical logs and decisions. The first month is the baseline. A falling
repeat rate without rising edits per report suggests progress; comments track content feedback
separately. Matching prose style-guide rules is not measured automatically.

Word choices, deletions, shortening, and comments can inform the guide. Reordering, moved or added
sections, and rewrites spanning inline links or bold text are not visible as document-level changes;
keep giving direct feedback on those.

Learning limits: concurrent writes are not locked and can lose updates; run learning commands sequentially.
Document identity uses titles: identical titles merge, while retitled revisions count as separate documents.

## Limits

- A sentence with a link or bold word inside is edited part by part: the text before it, the link or bold
  word, and the text after it. The link itself stays.
- Text drawn in images or on a canvas cannot be edited. SVG labels are single-line.
- The list tells the author what to change; it does not change the source file.
- Edits live in one browser on one device.
- Tested in Chromium, including pages opened directly from a file. Safari and Firefox have had less testing.

## Similar tools

The idea is not new. [EditCopy](https://github.com/coreyrab/editcopy) does nearly the same thing, and browser
extensions such as Overwrite cover the same need from the reader's side. I have not compared them in depth. What fixwords
offers, and what may or may not set it apart: no extension or install for the reader, an occurrence number when
the same text appears more than once ("occurrence 2 of 3"), edits that survive a reload, SVG labels, and a
command that keeps a strict CSP intact. If one of the others fits you better, use it.

## Development

```sh
npm ci && npx playwright install chromium-headless-shell
npm test                                                  # browser tests
python3 -m unittest discover -s tests -p 'test_*.py'     # command tests
```

## License

MIT
