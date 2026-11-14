# Project notes: the pile → grid transition (shelved)

The first version of the sticky-note projects had a pile on the home page. Featured notes were
stuck up in a row, and every other project sat in a loose pile next to a "see all →" label. The pile
was the link to /projects. Following it flew every note from its spot (row or pile) to its place in
the /projects grid, growing to full size on the way. "Back to home" gathered them back up.

It was taken out in favor of a plain link in the home page's subheading. This doc keeps what was
built and why it was shelved, so it can be picked back up.

## Why it was shelved

It felt choppy. SvelteKit swaps the whole page at once, so the new page's heading, intro and footer
appeared instantly, and only then did the notes start moving. The notes flew over a page that had
already finished changing, which reads as a glitch rather than a transition.

## How it worked

The notes on both pages carried `data-flip-id="note-<record id>"` on a wrapper element that has no
CSS transitions of its own (the tilt and hover live on the note inside it). `+layout.svelte`
captured them before navigating and animated from there after:

```ts
import { browser } from "$app/environment";
import { afterNavigate, beforeNavigate } from "$app/navigation";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

if (browser) gsap.registerPlugin(Flip);
const NOTE_PAGES = new Set(["/", "/projects"]);
const NOTES = '[data-flip-id^="note-"]';
let noteState: Flip.FlipState | null = null;

beforeNavigate(({ from, to, willUnload }) => {
  noteState = null;
  if (willUnload || !from || !to) return;
  const a = from.url.pathname;
  const b = to.url.pathname;
  if (a === b || !NOTE_PAGES.has(a) || !NOTE_PAGES.has(b)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.querySelector(NOTES)) return;
  noteState = Flip.getState(NOTES);
});

afterNavigate(() => {
  if (!noteState) return;
  const state = noteState;
  noteState = null;
  const targets = gsap.utils.toArray<HTMLElement>(NOTES);
  // Only notes that were on screen before fly; the rest just appear.
  const inView = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  };
  Flip.from(state, {
    targets: targets.filter(inView),
    duration: 0.9,
    ease: "power3.inOut",
    absolute: true,
    scale: true,
    stagger: 0.04,
    zIndex: 40,
  });
});
```

Flip pairs the old and new notes by `data-flip-id` even though they are different elements on
different pages.

The pile itself was markup on the home page: the non-featured projects, reversed so the first ended
up on top, each absolutely placed with a small seeded shuffle (about ±15px across, ±10px down) and
a barely-there tilt (±2.5°). Only the top note cast a full shadow, because thirteen stacked shadows
read as a dark smudge. The pile was 10.5rem wide (8.5rem on phones), small enough that the notes
visibly grew on their way into the grid.

## If it comes back

Fix the choppiness before anything else. Some options:

- Hold the new page's text back and fade it in after the notes land (or as they land), so the notes
  are the first thing that moves.
- Use the View Transitions API (`onNavigate` + `document.startViewTransition`) instead of Flip. The
  browser then cross-fades the rest of the page while the notes fly, which deals with the text
  appearing instantly.
- Keep it inside one page: spread the pile into a grid in place on the home page, with no navigation
  at all.

The mockups from the design rounds (pile, flight, pick-up) were built as a standalone HTML page
with GSAP Flip, outside this repo.
