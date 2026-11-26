#!/usr/bin/env python3
"""Inline fixwords into UTF-8 HTML files and update their CSP meta tags."""
import argparse
import json
import difflib
from datetime import datetime, timezone
import base64
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
import os
import stat
import tempfile
import sys
from urllib.parse import unquote, urlsplit


def normalize(js):
    js = js.replace('\r\n', '\n').replace('\r', '\n')
    if '</script' in js.lower():
        raise ValueError('script contains </script')
    if '<!--' in js:
        raise ValueError('script contains <!--')
    return js


def script_hash(js):
    return "'sha256-" + base64.b64encode(hashlib.sha256(normalize(js).encode('utf-8')).digest()).decode('ascii') + "'"


class Document(HTMLParser):
    """Collect edit spans without reserializing unrelated markup."""
    CDATA_CONTENT_ELEMENTS = ('script', 'style', 'textarea', 'title')

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.lines = [0] + [m.end() for m in re.finditer('\n', text)]
        self.tagged = False
        self.policies = []
        self.scripts = []
        self.bodies = []
        self.raw = None
        self.script = None
        self.feed(text)
        self.close()
        if self.script and self.script[2]:
            raise ValueError('unterminated <script data-fixwords> block')

    def position(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if self.raw:
            return
        attrs = dict(attrs)
        start = self.position()
        if tag in ('textarea', 'title', 'style', 'script'):
            self.raw = tag
        if tag == 'script':
            src = attrs.get('src') or ''
            external = unquote(urlsplit(src).path).rsplit('/', 1)[-1] == 'fixwords.js'
            self.script = (start, start + len(self.get_starttag_text()), 'data-fixwords' in attrs, external)
        if tag == 'meta':
            self.tagged |= (attrs.get('name') or '').lower() == 'fixwords'
            if (attrs.get('http-equiv') or '').lower() == 'content-security-policy':
                self.policies.append((start, start + len(self.get_starttag_text()), attrs.get('content') or ''))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.raw:
            if tag != self.raw:
                return
            if tag == 'script' and self.script:
                start, content_start, owned, external = self.script
                end_start = self.position()
                end = self.text.find('>', end_start) + 1
                if owned or external:
                    self.scripts.append((start, end, self.text[content_start:end_start] if owned else None))
                self.script = None
            self.raw = None
            return
        if tag == 'body':
            self.bodies.append(self.position())


def edit_policy(policy, token, old_tokens=()):
    directives = [part.split() for part in policy.split(';') if part.strip()]
    by_name = {}
    for directive in directives:
        by_name.setdefault(directive[0].lower(), directive)
    directive = by_name.get('script-src-elem', by_name.get('script-src'))
    fallback = directive is None
    if fallback:
        directive = by_name.get('default-src')
    if directive is None:
        return policy
    keywords = [source.lower() for source in directive[1:]]
    sources = [source for source in directive[1:] if source not in old_tokens]
    if "'unsafe-inline'" in keywords and not any(re.match(r"'(?:sha256-|sha384-|sha512-|nonce-|strict-dynamic')", word) for word in keywords):
        return policy
    else:
        sources = [source for source in sources if source.lower() != "'none'"]
        if token not in sources:
            sources.append(token)
        if fallback:
            directives.append(['script-src', *sources])
        else:
            directive[1:] = sources
    result = '; '.join(' '.join(part) for part in directives)
    # Preserve original formatting when the policy already authorizes this script.
    if result == '; '.join(' '.join(part.split()) for part in policy.split(';') if part.strip()):
        return policy
    return result


def rewrite_content(tag, policy):
    """Replace the content value while retaining the original tag spelling."""
    attribute = re.compile(r"([^\s=/>]+)(?:\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+)))?")
    for match in attribute.finditer(tag, len('<meta')):
        if match[1].lower() != 'content':
            continue
        group = next((i for i in (2, 3, 4) if match[i] is not None), None)
        quote = "'" if group == 3 else '"'
        escaped = policy.replace('&', '&amp;').replace(quote, '&#39;' if quote == "'" else '&quot;')
        if group in (2, 3):
            start, end = match.span(group)
            return tag[:start] + escaped + tag[end:]
        if group == 4:
            start, end = match.span(group)
            return tag[:start] + '"' + escaped + '"' + tag[end:]
        return tag[:match.end()] + '="' + escaped + '"' + tag[match.end():]
    return tag


def inject_text(text, js):
    """Return HTML with one inline script; input and output are Unicode strings."""
    js = normalize(js)
    doc = Document(text)
    old_tokens = {script_hash(content) for _, _, content in doc.scripts if content is not None}
    edits = [(start, end, '') for start, end, _ in doc.scripts]
    for start, end, policy in doc.policies:
        rewritten = edit_policy(policy, script_hash(js), old_tokens)
        if rewritten != policy:
            edits.append((start, end, rewrite_content(text[start:end], rewritten)))
    for start, end, replacement in sorted(edits, reverse=True):
        text = text[:start] + replacement + text[end:]
    doc = Document(text)
    end = doc.bodies[-1] if doc.bodies else len(text)
    return text[:end] + '<script data-fixwords>' + js + '</script>' + text[end:]


def read_utf8(path):
    try:
        return path.read_bytes().decode('utf-8')
    except (OSError, UnicodeError) as error:
        raise ValueError(f'cannot read UTF-8 file {path}: {error}') from error


def refuse_symlink(path, root=None):
    """Refuse a link at path, and at each directory between it and root (the tree this run writes into)."""
    for candidate in (path, *path.parents):
        if candidate.is_symlink():
            raise ValueError(f'refused symlink: {candidate}')
        if root is None or candidate == root:
            break
    if path.exists() and not (path.is_file() or path.is_dir()):
        raise ValueError(f'not a regular file or directory: {path}')


def walk_files(source):
    """Walk without following links, including directory links for reporting."""
    for parent, directories, files in os.walk(source, followlinks=False):
        for name in sorted(directories + files):
            yield Path(parent) / name
        directories[:] = sorted(name for name in directories if not (Path(parent) / name).is_symlink())


def data_home():
    return Path(os.environ.get('FIXWORDS_HOME', '~/.local/share/fixwords')).expanduser()


def write_data(name, text):
    home = data_home()
    refuse_symlink(home)
    home.mkdir(mode=0o700, parents=True, exist_ok=True)
    home.chmod(0o700)
    target = home / name
    refuse_symlink(target)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=home, prefix='.fixwords-', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(text.encode('utf-8'))
        os.replace(temporary, target)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def read_rows(name):
    path = data_home() / name
    refuse_symlink(path)
    return [json.loads(line) for line in read_utf8(path).splitlines() if line.strip()] if path.exists() else []


def write_rows(name, rows):
    write_data(name, ''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in rows))


def occurrence_hint(label):
    patterns = [r'（(\d+)か所目／全(\d+)か所(?:・見出し「(.*)」の下)?）$',
                r' \(occurrence (\d+) of (\d+)(?:; under “(.*)”)?\)$']
    for pattern in patterns:
        match = re.search(pattern, label)
        if match:
            return label[:match.start()], [int(match[1]), int(match[2])], match[3] or ''
    return label, None, ''


def parse_report(text):
    lines = [re.sub(r'^\s*> ?', '', line).strip() for line in text.splitlines()]
    title_index = next((i for i, line in enumerate(lines)
                        if line.endswith(' 文言の直し') or line.endswith(' — Wording changes')), None)
    if title_index is None:
        raise ValueError('report title not found')
    title = re.sub(r'( 文言の直し| — Wording changes)$', '', lines[title_index])
    body = lines[title_index + 1:]
    genre = ''
    if body and (body[0].startswith('種類：') or body[0].startswith('Type:')):
        genre = re.split('：|:', body.pop(0), maxsplit=1)[1].strip()
    items = []
    index = 0
    number = '?'
    while index < len(body):
        line = body[index]
        index += 1
        if not line or line in ('（直した箇所はありません）', '(No changes)'):
            continue
        match = re.match(r'(\d+)\. (.*)', line)
        if not match:
            raise ValueError(f'unparseable item {number}: unexpected line {line!r}')
        number, label = match.groups()
        item = dict(doc=title, genre=genre, kind='', before='', after='', target='', note='',
                    question=False, figure=False, occurrence=None, heading='', hunks=[])
        for prefix in ('（図）', '(figure) '):
            if label.startswith(prefix):
                item['figure'] = True
                label = label[len(prefix):]
        if index >= len(body):
            raise ValueError(f'unparseable item {number}')
        value = body[index]
        index += 1
        edit = re.match(r'^(元(?:（.*）)?|Before(?: \(.*\))?)[：:] ?(.*)$', label)
        note = re.match(r'^(?:内容：|Note:)\s?(.*)$', value)
        if edit and re.match(r'^(?:新：|After:)\s?', value):
            base, item['occurrence'], item['heading'] = occurrence_hint(edit[1])
            if base not in ('元', 'Before'):
                raise ValueError(f'unparseable item {number}')
            item.update(kind='edit', before=edit[2], after=re.sub(r'^(?:新：|After:)\s?', '', value))
            item['hunks'] = split_hunks(item['before'], item['after'])
        elif note:
            label, item['occurrence'], item['heading'] = occurrence_hint(label)
            if label in ('コメント（ページ全体）', 'Comment (whole page)'):
                target = ''
            elif label.startswith('コメント（対象：') and label.endswith('）'):
                target = label[len('コメント（対象：'):-1]
            elif label.startswith('Comment on: '):
                target = label[len('Comment on: '):]
            else:
                raise ValueError(f'unparseable item {number}')
            item.update(kind='comment', target=target, note=note[1], question=note[1].endswith(('?', '？')))
        else:
            raise ValueError(f'unparseable item {number}')
        items.append(item)
    return items


def script_class(char):
    if '\u4e00' <= char <= '\u9fff' or '\u3400' <= char <= '\u4dbf' or char in '々〆ヶ':
        return 'kanji'
    if '\u3041' <= char <= '\u309f':
        return 'hiragana'
    if '\u30a0' <= char <= '\u30ff' or '\uff66' <= char <= '\uff9f':
        return 'katakana'
    if char.isascii() and char.isalnum() or '\uff10' <= char <= '\uff19' or '\uff21' <= char <= '\uff3a' or '\uff41' <= char <= '\uff5a':
        return 'latin'
    return 'other'


def word_spans(text):
    runs = []
    for i, char in enumerate(text):
        kind = script_class(char)
        if runs and runs[-1][2] == kind:
            runs[-1][1] = i + 1
        else:
            runs.append([i, i + 1, kind])
    words = []
    for start, end, kind in runs:
        if kind == 'hiragana' and words and words[-1][2] == 'kanji':
            words[-1][1] = end
        else:
            words.append([start, end, kind])
    return words


def split_hunks(before, after):
    """Widen character changes to script words, merge touching spans.

    After widening, retain a shared leading kanji run as context. Thus
    確認を行う → 確認する yields を行う → する, including the particle.
    Insertions at word edges include the adjoining word only when its
    script matches the inserted text (e.g. サーバ → サーバー).
    """
    def widen(text, start, end, other):
        if start == end:
            if not other:
                return start, end
            kind = script_class(other[0])
            for left, right, word_kind in word_spans(text):
                if left < start < right or (right == start and word_kind == kind):
                    return left, right
            return start, end
        for left, right, _ in word_spans(text):
            if left < end and right > start:
                start, end = min(start, left), max(end, right)
        return start, end

    spans = []
    for tag, i, j, k, l in difflib.SequenceMatcher(None, before, after, autojunk=False).get_opcodes():
        if tag == 'equal':
            continue
        i, j = widen(before, i, j, after[k:l])
        k, l = widen(after, k, l, before[i:j])
        if spans and (i <= spans[-1][1] or k <= spans[-1][3]):
            old = spans.pop()
            i, j, k, l = min(i, old[0]), max(j, old[1]), min(k, old[2]), max(l, old[3])
        spans.append((i, j, k, l))
    hunks = []
    for i, j, k, l in spans:
        while i < j and k < l and before[i] == after[k] and script_class(before[i]) == 'kanji':
            i += 1
            k += 1
        b, a = before[i:j], after[k:l]
        hunk = dict(b=b, a=a, ctx=before[max(0, i - 12):min(len(before), j + 12)])
        if all(script_class(c) == 'other' for c in b + a):
            hunk['p'] = True
        hunks.append(hunk)
    return hunks


def log_report(args):
    text = sys.stdin.read() if args.file == '-' else read_utf8(Path(args.file))
    items = parse_report(text)
    rows = read_rows('log.jsonl')
    def key(row):
        return json.dumps([row.get(k) for k in ('doc', 'kind', 'before', 'after', 'target', 'note', 'occurrence')], ensure_ascii=False)
    seen = {key(row) for row in rows}
    counts = dict(edit=0, comment=0)
    skipped = 0
    timestamp = datetime.now(timezone.utc).isoformat()
    for item in items:
        if args.doc is not None:
            item['doc'] = args.doc
        if args.genre is not None:
            item['genre'] = args.genre
        if key(item) in seen:
            skipped += 1
            continue
        seen.add(key(item))
        counts[item['kind']] += 1
        rows.append(dict(ts=timestamp, **item))
    if sum(counts.values()):
        write_rows('log.jsonl', rows)
    print(f"logged {counts['edit']} edits, {counts['comment']} comments ({skipped} already logged)")


def aggregate(rows):
    pairs = {}
    for row in rows:
        for hunk in row.get('hunks', []):
            pair = (hunk['b'], hunk['a'])
            info = pairs.setdefault(pair, dict(count=0, docs=set(), first=row['ts'][:10], ctx=hunk['ctx'], p=False))
            info['count'] += 1
            info['docs'].add(row['doc'])
            info['first'] = min(info['first'], row['ts'][:10])
            info['p'] |= hunk.get('p', False)
    return pairs


def decision_map(decisions):
    return {(row['b'], row['a']): row['decision'] for row in decisions}


def eligible(pair, info, decisions):
    b, a = pair
    return (bool(b) and not re.search(re.escape(b), a)
            and not info.get('p') and any(script_class(c) != 'other' for c in b + a)
            and decisions.get(pair) != 'reject'
            and (decisions.get(pair) == 'accept' or (info['count'] >= 3 and len(info['docs']) >= 2)))


def promoted_pairs(rows, decisions):
    pairs = aggregate(rows)
    choices = decision_map(decisions)
    for pair, choice in choices.items():
        if choice == 'accept':
            pairs.setdefault(pair, dict(count=0, docs=set(), first='', ctx='', p=False))
    return pairs, {pair for pair, info in pairs.items() if eligible(pair, info, choices)}


def pair_commands(pair):
    import shlex
    argument = shlex.quote('='.join(pair))
    return f'python3 fixwords.py accept {argument}', f'python3 fixwords.py reject {argument}'


def prh_pattern(text):
    # prh uses /.../ to distinguish a regex from a plain string pattern.
    # Escape JavaScript regex metacharacters and the slash delimiter.
    escaped = re.sub(r'([\\^$.*+?()\[\]{}|/])', r'\\\1', text)
    return '/' + escaped.replace('\n', r'\n').replace('\r', r'\r') + '/'


def learn():
    rows, decisions = read_rows('log.jsonl'), read_rows('decisions.jsonl')
    pairs, promoted = promoted_pairs(rows, decisions)
    yaml = ['# Generated by fixwords; overwritten by learn.', 'version: 1', 'rules:' if promoted else 'rules: []']
    quote = lambda text: json.dumps(text, ensure_ascii=False)
    for pair in sorted(promoted):
        b, a = pair
        info = pairs[pair]
        since = info['first'] or next(row['ts'][:10] for row in reversed(decisions) if (row['b'], row['a']) == pair)
        yaml.extend(['- expected: ' + quote(a), '  pattern: ' + quote(prh_pattern(b)),
                     '  prh: ' + quote(f"fixwords: {info['count']} times in {len(info['docs'])} documents since {since}")])
    write_data('prh.yml', '\n'.join(yaml) + '\n')
    candidates = ['# Wording candidates', '', 'Review in context; rejection blocks promotion until a later acceptance.', '']
    unpromoted = sorted(set(pairs) - promoted, key=lambda pair: (-pairs[pair]['count'], pair))
    for pair in unpromoted:
        info = pairs[pair]
        accept, reject = pair_commands(pair)
        candidates.extend([f"- {quote(pair[0])} → {quote(pair[1])}: {info['count']} times, {len(info['docs'])} documents",
                           f"  Context: {quote(info['ctx'])}", f'  Accept: {accept}', f'  Reject: {reject}', ''])
    write_data('candidates.md', '\n'.join(candidates) + '\n')
    digest = ['# Evidence for a style guide', '',
              'Summarize into style-guide.md: per genre, what to cut, what to shorten, wording preferences that depend on context; do not invent rules; quote evidence counts.',
              'Ask the author to review the guide. Structure and reordering are not visible in these reports.', '']
    genres = sorted({row.get('genre', '') for row in rows})
    for genre in genres:
        selected = [row for row in rows if row.get('genre', '') == genre]
        digest.extend(['## Genre: ' + quote(genre or '(unspecified)'), ''])
        sections = {
            'Deletions': [row for row in selected if row['kind'] == 'edit' and not row['after']],
            'Shortenings': [row for row in selected if row['kind'] == 'edit' and row['after'] and len(row['after']) < .7 * len(row['before'])],
            'Comments': [row for row in selected if row['kind'] == 'comment'],
        }
        for title, evidence in sections.items():
            digest.extend(['### ' + title, ''])
            grouped = {}
            for row in evidence:
                if row['kind'] == 'comment':
                    key = ('[question] ' if row.get('question') else '') + quote(row['note']) + ' (target: ' + quote(row.get('target', '')) + ')'
                else:
                    key = quote(row['before']) + ' → ' + quote(row['after'])
                count, recent = grouped.get(key, (0, ''))
                grouped[key] = (count + 1, max(recent, row['ts']))
            for key in sorted(grouped, key=lambda key: (-grouped[key][0], -datetime.fromisoformat(grouped[key][1]).timestamp(), key))[:40]:
                count, recent = grouped[key]
                digest.append(f'- {count} evidence items; latest {recent[:10]}: {key}')
            digest.append('')
        digest.extend(['### Unpromoted pairs', ''])
        local = aggregate(selected)
        repeated = [pair for pair in local if pair not in promoted and local[pair]['count'] >= 2]
        for pair in sorted(repeated, key=lambda pair: (-local[pair]['count'], pair))[:40]:
            info = local[pair]
            digest.append(f"- {quote(pair[0])} → {quote(pair[1])}: {info['count']} times in {len(info['docs'])} documents; context {quote(info['ctx'])}")
        digest.append('')
    write_data('digest.md', '\n'.join(digest) + '\n')
    print(f'{len(promoted)} promoted, {len(unpromoted)} candidates, {len(genres)} genres')


def record_decision(args):
    if '=' not in args.pair:
        raise ValueError('pair must be B=A (use an empty A for deletion)')
    b, a = args.pair.split('=', 1)
    rows = read_rows('decisions.jsonl')
    rows.append(dict(ts=datetime.now(timezone.utc).isoformat(), b=b, a=a, decision=args.command))
    write_rows('decisions.jsonl', rows)
    learn()


def stats():
    rows, decisions = read_rows('log.jsonl'), read_rows('decisions.jsonl')
    print('month  reports  edits/report  comments/report  repeat-rate')
    for month in sorted({row['ts'][:7] for row in rows}):
        current = [row for row in rows if row['ts'][:7] == month]
        _, promoted = promoted_pairs([row for row in rows if row['ts'][:7] < month],
                                     [row for row in decisions if row['ts'][:7] < month])
        reports = len({(row['doc'], row['ts']) for row in current})
        edits = sum(row['kind'] == 'edit' for row in current)
        comments = sum(row['kind'] == 'comment' for row in current)
        hunks = [h for row in current for h in row.get('hunks', []) if not h.get('p')]
        repeats = sum((h['b'], h['a']) in promoted for h in hunks)
        rate = 100 * repeats / len(hunks) if hunks else 0
        print(f'{month}  {reports}  {edits / reports:.2f}  {comments / reports:.2f}  {rate:.1f}%')


def main(argv=None):
    parser = argparse.ArgumentParser(description='Inline fixwords, update CSP, and learn wording preferences locally.')
    parser.add_argument('--version', action='version', version='0.1.0', help='show version and exit')
    commands = parser.add_subparsers(dest='command', required=True)
    inject = commands.add_parser('inject', help='inject HTML files', description='A named file is always injected. Directories only inject pages with <meta name="fixwords"> unless --all is used.', epilog='Example: fixwords.py inject page.html --in-place')
    inject.add_argument('paths', nargs='+', type=Path, help='HTML files or directories to process')
    output = inject.add_mutually_exclusive_group()
    output.add_argument('-o', type=Path, metavar='OUT', help='output file (overwrites an existing regular file) or new/empty directory')
    output.add_argument('--in-place', action='store_true', help='replace input files in place')
    inject.add_argument('--all', action='store_true', help='inject every HTML file in directories')
    inject.add_argument('--check', action='store_true', help='list changes without writing')
    hash_command = commands.add_parser('hash', help='print the CSP hash', epilog='Example: fixwords.py hash --script fixwords.js')
    for command in (inject, hash_command):
        command.add_argument('--script', type=Path, default=Path(__file__).resolve().with_name('fixwords.js'), help='script to inline (default: fixwords.js next to fixwords.py)')
    log = commands.add_parser('log', help='store a received wording report locally')
    log.add_argument('file', nargs='?', default='-', help='UTF-8 report file, or - for stdin (default)')
    log.add_argument('--genre', help='override report genre')
    log.add_argument('--doc', help='override document title')
    commands.add_parser('learn', help='generate prh.yml, candidates.md and digest.md in the data home', description='Promote repeated word pairs (3 times in 2 documents), applying accept/reject decisions. No network or LLM calls.')
    for action in ('accept', 'reject'):
        decision = commands.add_parser(action, help=f'{action} a word pair and regenerate outputs')
        decision.add_argument('pair', metavar='B=A', help='literal before=after pair; later decisions win')
    commands.add_parser('stats', help='show monthly report counts and historical repeat rates')
    parser.epilog = 'Examples: fixwords.py inject page.html --in-place; fixwords.py log report.txt; fixwords.py learn. Learning data: $FIXWORDS_HOME or ~/.local/share/fixwords/.'
    args = parser.parse_args(argv)
    try:
        if args.command == 'learn':
            learn()
            return 0
        if args.command in ('accept', 'reject'):
            record_decision(args)
            return 0
        if args.command == 'stats':
            stats()
            return 0
        if args.command == 'log':
            log_report(args)
            return 0
        try:
            js = normalize(read_utf8(args.script))
        except ValueError as error:
            raise ValueError(f'cannot load script: {error}') from error
        if args.command == 'hash':
            print(script_hash(js))
            return 0
        if not (args.o or args.in_place or args.check):
            raise ValueError('inject requires -o, --in-place or --check')
        if args.o and len(args.paths) != 1:
            raise ValueError('-o requires exactly one input path')
        writes = {}
        messages = []
        directories = set()
        changed = False
        for source in args.paths:
            refuse_symlink(source)
            if not source.exists() or not (source.is_file() or source.is_dir()):
                raise ValueError(f'not a file or directory: {source}')
            directory = source.is_dir()
            if args.o:
                refuse_symlink(args.o)
                destination = args.o.resolve()
                origin = source.resolve()
                if destination == origin or (directory and origin in destination.parents):
                    raise ValueError(f'output must be outside input: {args.o}')
                if directory:
                    if args.o.exists() and (not args.o.is_dir() or any(args.o.iterdir())):
                        raise ValueError(f'choose a new directory: {args.o} must be new or empty')
                    directories.add(args.o)
                elif args.o.exists() and not args.o.is_file():
                    raise ValueError(f'output must be a regular file: {args.o}')
            files = walk_files(source) if directory else [source]
            for path in files:
                if path.is_symlink():
                    messages.append(f'{path}: skipped (symlink)')
                    continue
                target = (args.o / path.relative_to(source) if directory else args.o) if args.o else path
                root = args.o if directory else None
                refuse_symlink(target, root)
                if path.is_dir():
                    if args.o:
                        directories.add(target)
                    continue
                if not path.is_file():
                    raise ValueError(f'not a regular file: {path}')
                data = path.read_bytes()
                result = data
                status = 'unchanged'
                if not directory or path.suffix.lower() in ('.html', '.htm'):
                    text = read_utf8(path)
                    try:
                        if directory and not args.all and not Document(text).tagged:
                            status = 'skipped (no fixwords meta tag)'
                        else:
                            result = inject_text(text, js).encode('utf-8')
                    except ValueError as error:
                        raise ValueError(f'{path}: {error}') from error
                    if result != data:
                        status = 'injected'
                        changed = True
                messages.append(f'{path}: {status}')
                if target != path or result != data:
                    writes[target] = (result, path, root)
        if not args.check:
            for directory in sorted(directories):
                directory.mkdir(parents=True, exist_ok=True)
            # Stage every result before replacing any file.
            staged = []
            try:
                for target, (data, source, root) in writes.items():
                    refuse_symlink(target, root)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with tempfile.NamedTemporaryFile(dir=target.parent, prefix='.fixwords-', delete=False) as temp:
                        staged.append((Path(temp.name), target, root))
                        temp.write(data)
                    # A new output takes the mode of the file it came from, not the temp file's 0600; setuid, setgid and sticky bits are dropped.
                    os.chmod(temp.name, (target if target.exists() else source).stat().st_mode & 0o777)
                for temporary, target, root in staged:
                    refuse_symlink(target, root)
                    os.replace(temporary, target)
            finally:
                for temporary, _, _ in staged:
                    temporary.unlink(missing_ok=True)
        if messages:
            print('\n'.join(messages))
        return 1 if args.check and changed else 0
    except (OSError, ValueError) as error:
        print(f'fixwords: {error}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
