<script lang="ts">
  /**
   * The site terminal: breadcrumbs for the current path in its title bar, the post's headings when
   * reading one, and a prompt with tab completion that can reach every page (see $lib/terminal/shell).
   *
   * Desktop (≥1024px) shows it whole in the layout's left column. On phones it's a bar at the bottom
   * holding just the breadcrumbs; the arrow expands it, and it rides above the on-screen keyboard.
   */
  import { page } from "$app/state";
  import { afterNavigate, goto } from "$app/navigation";
  import { onMount, tick } from "svelte";
  import { theme } from "$lib/stores/theme";
  import { terminal } from "$lib/terminal/state.svelte";
  import {
    buildTree,
    complete,
    hrefOf,
    nearest,
    nodeAt,
    run,
    segmentsOf,
    type Action,
    type Context,
    type OutLine,
    type SiteTreeData,
  } from "$lib/terminal/shell";

  let { tree }: { tree: SiteTreeData } = $props();

  let root = $derived(buildTree(tree));
  let cwd = $derived(segmentsOf(page.url.pathname));

  let input = $state("");
  let sel = $state(0);
  let out = $state<OutLine[]>([]);
  let open = $state(false);
  let focused = $state(false);
  let previous = $state<string | null>(null);
  let inputEl = $state<HTMLInputElement>();
  let outEl = $state<HTMLElement>();
  /** Commands run this session, oldest first, for ↑ / ↓. */
  let history = $state<string[]>([]);
  /** Where ↑ / ↓ is in `history`; null while typing something new. */
  let historyAt = $state<number | null>(null);

  // The session is one running log, like a real terminal: it carries on across pages (the layout
  // keeps this component mounted) and across reloads (sessionStorage, per tab). Capped so it can't
  // grow without end.
  const LOG_LIMIT = 200;
  const STORE_KEY = "nicbat-terminal";
  onMount(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "null");
      if (saved) {
        out = saved.out ?? [];
        history = saved.history ?? [];
      }
    } catch {
      // Storage blocked or corrupt: start a fresh session.
    }
  });
  $effect(() => {
    const snapshot = JSON.stringify({ out, history: history.slice(-50) });
    try {
      sessionStorage.setItem(STORE_KEY, snapshot);
    } catch {
      // Storage blocked: the session still lasts until the tab closes or reloads.
    }
  });
  function log(lines: OutLine[]) {
    out = [...out, ...lines].slice(-LOG_LIMIT);
  }
  // Keep the newest output in view.
  $effect(() => {
    out.length;
    tick().then(() => outEl?.scrollTo({ top: outEl.scrollHeight }));
  });

  let ctx = $derived<Context>({ cwd, previous, headings: terminal.headings });
  let suggestions = $derived(complete(root, ctx, input));
  let selIdx = $derived(Math.min(sel, Math.max(0, suggestions.length - 1)));
  let ghost = $derived.by(() => {
    const top = suggestions[selIdx];
    return top && top.value.startsWith(input) ? top.value.slice(input.length) : "";
  });

  // Breadcrumbs. On a 404 the segments past the last real place are struck through.
  let realDepth = $derived.by(() => {
    let n = cwd.length;
    while (n > 0 && !nodeAt(root, cwd.slice(0, n))) n--;
    return n;
  });
  let crumbs = $derived(
    ["nicbat", ...cwd].map((name, i) => ({
      name,
      href: hrefOf(cwd.slice(0, i)),
      current: i === cwd.length,
      missing: i > realDepth,
    })),
  );
  let guess = $derived.by(() => {
    if (realDepth === cwd.length) return null;
    const g = nearest(root, cwd[cwd.length - 1]);
    return g ? hrefOf(g) : null;
  });

  // Headings indented relative to the post's top level, each tagged with the top-level section it's
  // in. Subheadings only show under the section being read, so the list opens up as you go.
  let allHeadings = $derived.by(() => {
    const top = Math.min(...terminal.headings.map((h) => h.depth));
    let section = "";
    return terminal.headings.map((h) => {
      const level = h.depth - top;
      if (level === 0) section = h.id;
      return { ...h, level, section };
    });
  });
  let activeSection = $derived(
    allHeadings.find((h) => h.id === terminal.activeHeading)?.section ?? null,
  );
  let headings = $derived(
    allHeadings.filter((h) => h.level === 0 || h.section === activeSection),
  );

  afterNavigate(({ from, to }) => {
    if (from && to && from.url.pathname !== to.url.pathname) {
      previous = from.url.pathname;
      // On phones, stay open if you were driving from the prompt; fold away after a page link.
      if (document.activeElement !== inputEl) open = false;
    }
  });

  function act(action: Action) {
    switch (action.type) {
      case "navigate":
        goto(action.href, { keepFocus: true });
        break;
      case "heading":
        document.getElementById(action.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        open = false;
        break;
      case "theme":
        theme.update((t) => action.value ?? (t === "light" ? "dark" : "light"));
        break;
      case "top":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "history":
        window.history.go(action.step);
        break;
      case "bottom":
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
        break;
      case "scroll":
        window.scrollBy({ top: window.innerHeight * action.by, behavior: "smooth" });
        break;
      case "quote":
        if (terminal.shuffleQuote) terminal.shuffleQuote();
        else log([{ text: "quote: the quotes live on the home page, try cd ~", tone: "error" }]);
        break;
      case "copy":
        navigator.clipboard
          .writeText(action.text)
          .then(() => log([{ text: `copied ${action.label}: ${action.text}`, tone: "muted" }]))
          .catch(() => log([{ text: `copy: couldn't reach the clipboard, here it is: ${action.text}`, tone: "error" }]));
        break;
      case "external":
        if (action.href.startsWith("mailto:")) location.href = action.href;
        else window.open(action.href, "_blank", "noopener,noreferrer");
        break;
    }
  }

  function execute() {
    const command = input.trim();
    const result = run(root, ctx, input);
    input = "";
    sel = 0;
    historyAt = null;
    if (!command) return;
    if (history[history.length - 1] !== command) history = [...history, command];
    if (result.clear) out = [];
    else {
      // Commands that only act (cd, theme, ...) still leave their line in the log.
      const lines = result.lines ?? [{ text: "$ " + command, tone: "echo" as const }];
      // Running the same one again straight after just bumps a counter: `$ quote x3`.
      const last = out[out.length - 1];
      if (lines.length === 1 && lines[0].tone === "echo" && last?.tone === "echo" && last.text === lines[0].text) {
        out = [...out.slice(0, -1), { ...last, count: (last.count ?? 1) + 1 }];
      } else log(lines);
    }
    if (result.action) act(result.action);
  }

  // ↑ / ↓ step through earlier commands when there are no suggestions to pick from.
  function recall(step: -1 | 1) {
    if (!history.length) return;
    const at = historyAt ?? history.length;
    const next = Math.min(history.length, Math.max(0, at + step));
    historyAt = next === history.length ? null : next;
    input = historyAt === null ? "" : history[historyAt];
    tick().then(() => inputEl?.setSelectionRange(input.length, input.length));
  }

  function accept(value: string) {
    input = value;
    sel = 0;
    inputEl?.focus();
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Tab" && suggestions.length) {
      e.preventDefault();
      accept(suggestions[selIdx].value);
    } else if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      sel = (selIdx + 1) % suggestions.length;
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      sel = (selIdx - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      recall(e.key === "ArrowUp" ? -1 : 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute();
    } else if (e.key === "Escape") {
      if (input) input = "";
      else if (out.length) out = [];
      else {
        inputEl?.blur();
        open = false;
      }
    }
  }

  // "/" anywhere jumps into the prompt, unless you're already typing somewhere.
  function onWindowKey(e: KeyboardEvent) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    e.preventDefault();
    open = true;
    inputEl?.focus();
  }

  // On phones, lift the bar above the on-screen keyboard: the visual viewport shrinks when it opens,
  // while fixed elements stay pinned to the (unchanged) layout viewport.
  let keyboard = $state(0);
  $effect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      keyboard = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  });
</script>

<svelte:window onkeydown={onWindowKey} />

{#if open}
  <!-- Phone only (hidden on desktop): tapping the dimmed page folds the terminal back down. -->
  <div class="term-backdrop" onclick={() => (open = false)} aria-hidden="true"></div>
{/if}

<section
  class="term"
  class:open
  class:reading={headings.length > 0}
  aria-label="Site terminal"
  style:--keyboard="{keyboard}px"
>
  <div class="term-bar">
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol>
        {#each crumbs as c, i (i)}
          <li>
            {#if i > 0}<span class="sep" aria-hidden="true">/</span>{/if}
            {#if c.missing}
              <s class="missing">{c.name}<span class="sr-only"> (not found)</span></s>
            {:else if c.current}
              <span class="here" class:home={i === 0} aria-current="page">{c.name}</span>
            {:else}
              <a href={c.href} class:home={i === 0}>{c.name}</a>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
    <button
      class="toggle"
      aria-expanded={open}
      aria-controls="term-body"
      aria-label={open ? "Close terminal" : "Open terminal"}
      onclick={() => (open = !open)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
    {#if terminal.progress !== null}
      <!-- How far through the post you are. Decorative: the heading list carries the same news. -->
      <div class="progress" aria-hidden="true">
        <div class="progress-fill" style:transform="scaleX({terminal.progress})"></div>
      </div>
    {/if}
  </div>

  <div class="term-body" id="term-body">
    {#if guess}
      <p class="line">did you mean <a href={guess}>{guess.slice(1)}</a>?</p>
    {/if}

    {#if headings.length}
      <nav class="heads" aria-label="On this page">
        {#each headings as h (h.id)}
          <a
            href="#{h.id}"
            class:active={terminal.activeHeading === h.id}
            class:sub={h.level > 0}
            style:padding-left="{h.level * 14}px"
            aria-current={terminal.activeHeading === h.id ? "location" : undefined}
            onclick={() => (open = false)}>{h.text}</a
          >
        {/each}
      </nav>
    {/if}

    {#if out.length}
      <div class="out" role="log" aria-live="polite" bind:this={outEl}>
        {#each out as line, i (i)}
          <div
            class="line"
            class:echo={line.tone === "echo"}
            class:error={line.tone === "error"}
            class:muted={line.tone === "muted"}
            style:padding-left={line.depth ? `${line.depth * 14}px` : undefined}
          >
            {line.text ?? ""}{#if line.count && line.count > 1}<span class="count">{` x${line.count}`}</span>{/if}{#each line.links ?? [] as link (link.href + link.label)}<a
                href={link.href}
                class="out-link"
                class:dir={link.dir}
                class:heading={link.heading}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onclick={() => link.heading && (open = false)}
                >{link.label}{link.dir && link.label !== "nicbat" ? "/" : ""}</a
              >{/each}
          </div>
        {/each}
      </div>
    {/if}

    <label class="prompt">
      <span class="dollar" aria-hidden="true">$</span>
      <span class="field">
        <span class="ghost" aria-hidden="true"><span class="typed">{input}</span>{ghost}</span>
        <input
          bind:this={inputEl}
          bind:value={input}
          oninput={() => (sel = 0)}
          {onkeydown}
          onfocus={() => (focused = true)}
          onblur={() => (focused = false)}
          aria-label="Command"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="go"
        />
      </span>
    </label>

    {#if focused && suggestions.length}
      <ul class="suggestions" role="listbox" aria-label="Suggestions">
        {#each suggestions as s, i (s.value)}
          <li role="option" aria-selected={i === selIdx}>
            <button
              tabindex="-1"
              class:selected={i === selIdx}
              onmousedown={(e) => e.preventDefault()}
              onclick={() => accept(s.value)}>{s.label}</button
            >
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .term {
    --t-bg: var(--color-bg-surface);
    --t-bar: var(--color-bg-overlay);
    --t-border: var(--color-border-secondary);
    --t-rule: 1px solid var(--color-border-secondary);
    --t-text: var(--color-text-primary);
    --t-muted: var(--color-text-secondary);
    --t-faint: var(--color-text-muted);
    --t-accent: var(--color-primary);
    --t-error: #9a4b2a;
    --t-glow: none;

    display: flex;
    flex-direction: column;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    line-height: 1.6;
    color: var(--t-muted);
    background: var(--t-bg);
    border: 1px solid var(--t-border);
    border-radius: 8px;
    overflow: hidden;
  }

  /* Dark mode reads as a console: a well darker than the page, a dashed rule, a faint glow. */
  :global(.dark) .term {
    --t-bg: #080b08;
    --t-bar: #080b08;
    --t-border: #2e362d;
    --t-rule: 1px dashed #3b4a37;
    --t-text: #e7ebe2;
    --t-muted: #8a9184;
    --t-faint: #7d8578;
    --t-accent: #a3cb81;
    --t-error: #e0a47e;
    --t-glow: 0 0 6px rgba(163, 203, 129, 0.45);
  }

  a {
    color: inherit;
    text-decoration: none;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }
  a:hover {
    color: var(--t-accent);
    text-decoration: underline;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--t-accent);
    outline-offset: 2px;
    border-radius: 2px;
  }
  /* The prompt itself is the focus cue: the caret blinks after the "$". */
  input:focus-visible {
    outline: none;
  }
  ul,
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* Focus on the prompt lights the whole terminal up, so it's clear where typing goes. */
  .term:has(input:focus) {
    border-color: var(--t-accent);
    box-shadow: 0 0 0 1px var(--t-accent);
  }

  .term-bar {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: var(--t-bar);
    border-bottom: var(--t-rule);
    padding: 8px 14px;
  }
  .crumbs {
    flex: 1;
    min-width: 0;
  }
  .progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    pointer-events: none;
  }
  .progress-fill {
    height: 100%;
    background: var(--t-accent);
    box-shadow: var(--t-glow);
    transform-origin: left;
    transition: transform 0.15s linear;
  }
  .crumbs ol {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
  }
  .crumbs li {
    display: inline-flex;
    align-items: baseline;
  }
  .crumbs a {
    color: var(--t-muted);
  }
  .crumbs .home {
    color: var(--t-text);
    font-weight: 700;
    text-shadow: var(--t-glow);
  }
  .crumbs a.home:hover {
    color: var(--t-accent);
  }
  .crumbs .here {
    color: var(--t-text);
    font-weight: 600;
  }
  .sep {
    color: var(--t-faint);
    padding: 0 1px;
  }
  .missing {
    color: var(--t-faint);
  }
  .toggle {
    display: none;
  }

  .term-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px 14px;
  }

  .heads {
    display: flex;
    flex-direction: column;
    font-family: ui-sans-serif, system-ui, sans-serif;
    order: 1;
  }
  .heads a {
    display: block;
    padding: 3px 0;
    line-height: 1.45;
    color: var(--t-muted);
  }
  .heads a.sub {
    font-size: 13px;
    color: var(--t-faint);
  }
  .heads a.active {
    color: var(--t-accent);
    font-weight: 600;
  }

  .prompt {
    order: 3;
    display: flex;
    align-items: baseline;
    gap: 8px;
    cursor: text;
  }
  .heads ~ .prompt,
  .out ~ .prompt {
    border-top: var(--t-rule);
    padding-top: 10px;
  }
  .dollar {
    color: var(--t-accent);
    text-shadow: var(--t-glow);
  }
  .field {
    position: relative;
    flex: 1;
    min-width: 0;
  }
  .ghost {
    position: absolute;
    inset: 0;
    white-space: pre;
    overflow: hidden;
    color: var(--t-faint);
    pointer-events: none;
  }
  .typed {
    color: transparent;
  }
  input {
    position: relative;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--t-text);
    caret-color: var(--t-accent);
    font: inherit;
    outline: none;
  }

  .suggestions {
    order: 4;
    margin: 0 0 0 16px;
    padding: 4px;
    border-radius: 6px;
    background: var(--t-bar);
  }
  .suggestions button {
    all: unset;
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 2px 8px;
    border-radius: 3px;
    cursor: pointer;
    color: var(--t-muted);
  }
  .suggestions button.selected,
  .suggestions button:hover {
    color: var(--t-text);
    background: var(--t-bg);
  }

  .out {
    order: 2;
    font-size: 13px;
    max-height: 40vh;
    overflow-y: auto;
  }
  .line {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .echo {
    color: var(--t-faint);
  }
  .count {
    color: var(--t-muted);
  }
  .error {
    color: var(--t-error);
  }
  .muted {
    color: var(--t-faint);
  }
  .out-link {
    display: inline-block;
    color: var(--t-text);
    margin-right: 12px;
    /* Names wrap as whole words, never mid-name. */
    white-space: nowrap;
  }
  .out-link.dir {
    color: var(--t-accent);
    font-weight: 700;
  }
  .out-link.heading {
    color: var(--t-muted);
    font-family: ui-sans-serif, system-ui, sans-serif;
  }

  .term-backdrop {
    display: none;
  }

  /* Phone and tablet: a bar pinned to the bottom, just the breadcrumbs until expanded. */
  @media (max-width: 1023.98px) {
    .term {
      position: fixed;
      left: 12px;
      right: 12px;
      bottom: calc(12px + var(--keyboard, 0px));
      z-index: 40;
      border-radius: 10px;
      box-shadow: 0 10px 28px rgba(5, 8, 5, 0.18);
    }
    /* Plain solid rules here: dashes look broken at phone sizes. */
    :global(.dark) .term {
      --t-rule: 1px solid #232b23;
    }
    .term-bar {
      padding: 0 2px 0 12px;
      border-bottom: 0;
    }
    .open .term-bar {
      border-bottom: var(--t-rule);
    }
    .crumbs ol {
      flex-wrap: nowrap;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
    }
    .crumbs ol::-webkit-scrollbar {
      display: none;
    }
    .crumbs a,
    .crumbs .here,
    .crumbs .missing {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
    .crumbs li {
      align-items: center;
    }
    .toggle {
      all: unset;
      flex: 0 0 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--t-muted);
    }
    .toggle svg {
      transition: transform 0.2s;
    }
    .open .toggle svg {
      transform: rotate(180deg);
    }

    .term-body {
      display: none;
      max-height: min(70vh, calc(100dvh - var(--keyboard, 0px) - 96px));
      padding: 10px 14px 12px;
    }
    .open .term-body {
      display: flex;
    }
    /* Output and suggestions sit above the prompt, so the prompt stays next to the keyboard. */
    .out {
      order: 2;
    }
    .suggestions {
      order: 3;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      margin: 0;
      padding: 0;
      background: none;
    }
    .suggestions button {
      display: flex;
      align-items: center;
      min-height: 36px;
      padding: 0 12px;
      border-radius: 99px;
      background: var(--t-bar);
      color: var(--t-text);
      white-space: nowrap;
    }
    .suggestions button.selected {
      background: var(--t-bar);
      box-shadow: inset 0 0 0 1px var(--t-accent);
    }
    .prompt {
      order: 4;
      min-height: 44px;
      align-items: center;
      border-top: var(--t-rule);
      padding-top: 4px;
    }
    .heads a {
      display: flex;
      align-items: center;
      min-height: 40px;
      font-size: 15px;
    }
    .heads a.sub {
      font-size: 14px;
    }
    .out-link {
      display: inline-block;
      padding: 4px 0;
    }
    /* 16px stops iOS zooming in when the prompt is focused; the ghost text matches it. */
    .field {
      font-size: 16px;
    }

    .term-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 39;
      background: rgba(5, 8, 5, 0.3);
    }
  }
</style>
