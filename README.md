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
3. To ask a question or leave a remark instead of rewriting, press **💬 Comment**, tap the text and write it
   (Ctrl/Cmd+Enter or tapping elsewhere saves). **Comment on the whole page** adds a note that belongs to no text.
   Commented text gets a dotted underline.
4. Press **Send your changes**. On a touch device (phone, tablet) the share sheet opens; on a computer the list
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

## Limits

- A piece of text is editable when its element contains only text and line breaks. A sentence with a link or
  bold word inside is edited part by part.
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
