// The site terminal's shell: the site as a folder tree, path resolution, tab completion and the
// commands. Pure functions only. Terminal.svelte owns the UI and carries out what `run` returns
// (navigating, toggling the theme, ...), so everything here can be reasoned about without a DOM.

import type { Heading } from '$lib/types';
import { contacts } from '$lib/contacts';

/** One place on the site. A `dir` has children you can `cd` into; a `page` is a leaf. */
export interface SiteNode {
  name: string;
  kind: 'dir' | 'page';
  children?: SiteNode[];
}

/** What `/api/tree` returns: the dynamic children of the site's sections. */
export interface SiteTreeData {
  words: string[];
}

/** A link in a line of output. `href` is a site path, or an external URL when `external`. */
export interface OutLink {
  label: string;
  href: string;
  dir?: boolean;
  external?: boolean;
  /** A heading on the current post: scrolled to rather than navigated to. */
  heading?: boolean;
}

export interface OutLine {
  text?: string;
  tone?: 'echo' | 'error' | 'muted';
  links?: OutLink[];
  /** Indent level, for `tree`. */
  depth?: number;
  /** How many times this command ran back to back (an echo line shown as `$ quote x3`). */
  count?: number;
}

export type Action =
  | { type: 'navigate'; href: string }
  | { type: 'heading'; id: string }
  | { type: 'theme'; value?: 'light' | 'dark' }
  | { type: 'top' }
  | { type: 'bottom' }
  /** The browser's back (-1) / forward (1). */
  | { type: 'history'; step: -1 | 1 }
  /** Scroll by this fraction of the window: 0.5 is half a screen down, -0.5 half up. */
  | { type: 'scroll'; by: number }
  | { type: 'quote' }
  | { type: 'external'; href: string }
  | { type: 'copy'; text: string; label: string };

export interface RunResult {
  lines?: OutLine[];
  clear?: boolean;
  action?: Action;
}

export interface Context {
  /** The current path as segments, e.g. ['words', 'matcha']. */
  cwd: string[];
  /** The page before this one, for `cd -`. */
  previous: string | null;
  /** The current post's headings, empty elsewhere. */
  headings: Heading[];
}

export interface Suggestion {
  label: string;
  /** The whole input once this suggestion is accepted. */
  value: string;
}

export const commands = [
  'cd', 'ls', 'tree', 'help', 'clear', 'back', 'forward', 'theme', 'light', 'dark', 'top', 'bottom', 'up', 'down', 'quote',
  'contact', 'open', 'copy'
];

// Commands that take an argument; completing one adds a space after it.
const takesArg = new Set(['cd', 'ls', 'tree', 'theme', 'open', 'copy']);

// Shortcuts: `home` and each top-level section (`photos`, `projects`, ...) go straight there, and
// each contact (`github`, `email`, ...) opens it.
const shortcuts = (root: SiteNode): string[] => [
  'home',
  ...(root.children ?? []).map((c) => c.name),
  ...contacts.map((c) => c.name)
];

// What `copy` puts on the clipboard: the address itself for email, the URL for the rest.
const copyText = (href: string) => href.replace(/^mailto:/, '');

// Commands whose argument is a path, so completion offers places after them.
const pathCommands = new Set(['cd', 'ls', 'tree']);

export const buildTree = (data: SiteTreeData): SiteNode => {
  const pages = (names: string[]): SiteNode[] => names.map((name) => ({ name, kind: 'page' }));
  return {
    name: '',
    kind: 'dir',
    children: [
      { name: 'photos', kind: 'page' },
      { name: 'projects', kind: 'page' },
      { name: 'words', kind: 'dir', children: pages(data.words) },
      { name: 'now', kind: 'page' }
    ]
  };
};

export const segmentsOf = (pathname: string): string[] =>
  pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s));

export const hrefOf = (segments: string[]): string => '/' + segments.map(encodeURIComponent).join('/');

/** The node at `segments`, or null when there is none. */
export const nodeAt = (root: SiteNode, segments: string[]): SiteNode | null => {
  let node: SiteNode | undefined = root;
  for (const seg of segments) {
    node = node?.children?.find((c) => c.name === seg);
    if (!node) return null;
  }
  return node;
};

// Apply a path argument to `cwd`: absolute (`/x`, `~/x`, `~`), relative, `.` and `..`.
const walk = (cwd: string[], arg: string): string[] => {
  let out = arg.startsWith('/') || arg.startsWith('~') ? [] : cwd.slice();
  for (const part of arg.replace(/^~/, '').split('/')) {
    if (!part || part === '.') continue;
    out = part === '..' ? out.slice(0, -1) : out.concat(part);
  }
  return out;
};

/**
 * Resolve a `cd` argument to a place on the site. `#id` alone is a heading on the current post;
 * `path#id` is a page plus a heading to open it at. Returns null when the path doesn't exist.
 */
export const resolve = (
  root: SiteNode,
  ctx: Context,
  arg: string
): { segments: string[]; hash?: string } | null => {
  const [pathPart, hash] = arg.split('#', 2) as [string, string | undefined];
  if (!pathPart && hash != null) {
    return ctx.headings.some((h) => h.id === hash) ? { segments: ctx.cwd, hash } : null;
  }
  const segments = walk(ctx.cwd, pathPart);
  return nodeAt(root, segments) ? { segments, hash: hash || undefined } : null;
};

const levenshtein = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
};

/** The closest real place to a mistyped name (within two edits), for "did you mean". */
export const nearest = (root: SiteNode, word: string): string[] | null => {
  let best: { d: number; segments: string[] } | null = null;
  const visit = (node: SiteNode, at: string[]) => {
    for (const child of node.children ?? []) {
      const segments = at.concat(child.name);
      const d = levenshtein(word.toLowerCase(), child.name);
      if (d <= 2 && (!best || d < best.d)) best = { d, segments };
      visit(child, segments);
    }
  };
  visit(root, []);
  return best ? (best as { segments: string[] }).segments : null;
};

const childLinks = (node: SiteNode, at: string[]): OutLink[] =>
  (node.children ?? []).map((c) => ({
    label: c.name,
    href: hrefOf(at.concat(c.name)),
    dir: c.kind === 'dir'
  }));

const treeLines = (root: SiteNode, ctx: Context): OutLine[] => {
  const lines: OutLine[] = [{ links: [{ label: 'nicbat', href: '/', dir: true }] }];
  const here = ctx.cwd.join('/');
  const visit = (node: SiteNode, at: string[], depth: number) => {
    for (const child of node.children ?? []) {
      const segments = at.concat(child.name);
      lines.push({
        depth,
        links: [{ label: child.name, href: hrefOf(segments), dir: child.kind === 'dir' }]
      });
      // The post you're reading lists its headings, so `tree` doubles as a table of contents.
      if (segments.join('/') === here) {
        const top = Math.min(...ctx.headings.map((h) => h.depth));
        for (const h of ctx.headings) {
          lines.push({
            depth: depth + 1 + h.depth - top,
            links: [{ label: h.text, href: '#' + h.id, heading: true }]
          });
        }
      }
      visit(child, segments, depth + 1);
    }
  };
  visit(root, [], 1);
  return lines;
};

const help: OutLine[] = [
  { text: 'cd <place>   go there (.. up, - back, #heading)' },
  { text: '..           same as cd ..' },
  { text: 'back/forward like the browser buttons' },
  { text: 'ls / tree    what is here / everything' },
  { text: 'theme        toggle light / dark (or theme light|dark)' },
  { text: 'light / dark switch directly to that mode' },
  { text: 'home · photos · projects · words · now' },
  { text: 'contact      my links; open or copy <link>' },
  { text: 'top · bottom · up · down   scroll (up/down: half a screen)' },
  { text: 'quote        a new quote on home' },
  { text: 'tab completes · ↑↓ picks · esc clears', tone: 'muted' }
];

export const run = (root: SiteNode, ctx: Context, input: string): RunResult => {
  const raw = input.trim();
  if (!raw) return {};
  // A bare path is a `cd`, like zsh's auto_cd: `..`, `../photos`, `~`.
  if (/^(\.\.|~)(\/|$)/.test(raw)) return run(root, ctx, 'cd ' + raw);
  const [cmd, ...rest] = raw.split(/\s+/);
  const arg = rest.join(' ').replace(/(.)\/$/, '$1');
  const echo: OutLine = { text: '$ ' + raw, tone: 'echo' };
  const fail = (text: string, extra: OutLine[] = []): RunResult => ({
    lines: [echo, { text, tone: 'error' }, ...extra]
  });

  switch (cmd) {
    case 'cd': {
      if (arg === '-') {
        return ctx.previous ? { action: { type: 'navigate', href: ctx.previous } } : fail('cd: no previous page');
      }
      const target = resolve(root, ctx, arg);
      if (!target) {
        const guess = nearest(root, arg.replace(/#.*$/, '').split('/').filter(Boolean).pop() ?? '');
        return fail(
          `cd: ${arg}: No such file or directory`,
          guess ? [{ text: 'did you mean ', links: [{ label: guess.join('/'), href: hrefOf(guess) }] }] : []
        );
      }
      if (target.hash && target.segments.join('/') === ctx.cwd.join('/')) {
        return { action: { type: 'heading', id: target.hash } };
      }
      return {
        action: { type: 'navigate', href: hrefOf(target.segments) + (target.hash ? '#' + target.hash : '') }
      };
    }
    case 'ls': {
      const segments = arg ? walk(ctx.cwd, arg) : ctx.cwd;
      const node = nodeAt(root, segments);
      if (!node) return fail(`ls: cannot access '${arg}': No such file or directory`);
      if (node.kind === 'page') {
        const heads = segments.join('/') === ctx.cwd.join('/') ? ctx.headings : [];
        return {
          lines: heads.length
            ? [echo, { links: heads.map((h) => ({ label: '#' + h.id, href: '#' + h.id, heading: true })) }]
            : [echo, { text: '(a page, nothing below it)', tone: 'muted' }]
        };
      }
      return { lines: [echo, { links: childLinks(node, segments) }] };
    }
    case 'tree':
      return { lines: [echo, ...treeLines(root, ctx)] };
    case 'help':
      return { lines: [echo, ...help] };
    case 'clear':
      return { clear: true };
    case 'theme':
      if (arg && arg !== 'light' && arg !== 'dark') return fail('usage: theme [light|dark]');
      return { action: { type: 'theme', value: (arg as 'light' | 'dark') || undefined } };
    case 'light':
    case 'dark':
      if (arg) return fail(`usage: ${cmd}`);
      return { action: { type: 'theme', value: cmd } };
    case 'top':
      return { action: { type: 'top' } };
    case 'bottom':
      return { action: { type: 'bottom' } };
    case 'back':
    case 'forward':
      return { action: { type: 'history', step: cmd === 'back' ? -1 : 1 } };
    case 'up':
    case 'down':
      return { action: { type: 'scroll', by: cmd === 'up' ? -0.5 : 0.5 } };
    case 'quote':
      return { action: { type: 'quote' } };
    case 'contact':
      return {
        lines: [echo, { links: contacts.map((c) => ({ label: c.name, href: c.href, external: true })) }]
      };
    case 'open': {
      const link = contacts.find((c) => c.name === arg.toLowerCase());
      if (link) return { action: { type: 'external', href: link.href } };
      return run(root, ctx, 'cd ' + arg);
    }
    case 'copy': {
      const link = contacts.find((c) => c.name === arg.toLowerCase());
      if (!link) return fail(`usage: copy <${contacts.map((c) => c.name).join('|')}>`);
      return {
        lines: [echo],
        action: { type: 'copy', text: copyText(link.href), label: link.name }
      };
    }
    case 'home':
      return run(root, ctx, 'cd /');
    default: {
      if (!arg && root.children?.some((c) => c.name === cmd)) return run(root, ctx, 'cd /' + cmd);
      const link = contacts.find((c) => c.name === cmd);
      if (!arg && link) return { action: { type: 'external', href: link.href } };
      return fail(`bash: ${cmd}: command not found`);
    }
  }
};

/** Completions for what's typed so far, best first. */
export const complete = (root: SiteNode, ctx: Context, input: string): Suggestion[] => {
  if (!input) return [];
  const space = input.indexOf(' ');
  if (space < 0) {
    return [...commands, ...shortcuts(root)]
      .filter((c, i, all) => c.startsWith(input) && c !== input && all.indexOf(c) === i)
      .map((c) => ({ label: c, value: takesArg.has(c) ? c + ' ' : c }));
  }
  const cmd = input.slice(0, space);
  const partial = input.slice(space + 1);

  if (cmd === 'theme') {
    return ['light', 'dark']
      .filter((t) => t.startsWith(partial) && t !== partial)
      .map((t) => ({ label: t, value: `theme ${t}` }));
  }
  if (cmd === 'open' || cmd === 'copy') {
    return contacts
      .map((c) => c.name)
      .filter((n) => n.startsWith(partial) && n !== partial)
      .map((n) => ({ label: n, value: `${cmd} ${n}` }));
  }
  if (!pathCommands.has(cmd)) return [];

  // `#par` completes the current post's headings.
  if (partial.startsWith('#')) {
    const frag = partial.slice(1);
    return ctx.headings
      .filter((h) => h.id.startsWith(frag) && h.id !== frag)
      .map((h) => ({ label: '#' + h.id, value: `${cmd} #${h.id}` }));
  }

  const cut = partial.lastIndexOf('/');
  const base = cut >= 0 ? partial.slice(0, cut + 1) : '';
  const frag = cut >= 0 ? partial.slice(cut + 1) : partial;
  const dirSegs = cut >= 0 ? walk(ctx.cwd, base || '/') : ctx.cwd;
  const dir = nodeAt(root, dirSegs);
  if (!dir || dir.kind !== 'dir') return [];

  const names = (dir.children ?? []).map((c) => ({ name: c.name, slash: c.kind === 'dir' ? '/' : '' }));
  if (!base && ctx.cwd.length) names.unshift({ name: '..', slash: '/' });
  return names
    .filter((n) => n.name.startsWith(frag) && n.name + n.slash !== frag)
    .map((n) => ({ label: n.name + n.slash, value: `${cmd} ${base}${n.name}${n.slash}` }));
};
