// What pages tell the site terminal. A post publishes its headings and the one being read; the home
// page offers its quote shuffle for the `quote` command. Pages set these on mount and clear them on
// unmount, so the terminal only ever sees the current page's.
import type { Heading } from '$lib/types';

class TerminalState {
  headings = $state<Heading[]>([]);
  /** Id of the heading being read, null above the first one. */
  activeHeading = $state<string | null>(null);
  /** How far through the post you've read, 0–1. Null when not reading a post. */
  progress = $state<number | null>(null);
  /** Shuffles the home quote. Null on every other page. */
  shuffleQuote = $state<(() => void) | null>(null);
}

export const terminal = new TerminalState();

/**
 * Track which of `headings` is being read (the last one whose top has scrolled past `offset` px) and
 * how far through `article` you are: 0 with its top at the top of the window, 1 with its end in view.
 * Returns a cleanup that removes the listener and clears the terminal's post state.
 */
export const trackHeadings = (
  headings: Heading[],
  article?: HTMLElement,
  offset = 120
): (() => void) => {
  terminal.headings = headings;
  const els = headings
    .map((h) => document.getElementById(h.id))
    .filter((el): el is HTMLElement => el !== null);

  let frame = 0;
  const update = () => {
    frame = 0;
    let current: string | null = null;
    for (const el of els) {
      if (el.getBoundingClientRect().top - offset <= 0) current = el.id;
      else break;
    }
    // At the very bottom the last heading may never reach the offset; count it as read.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && els.length) {
      current = els[els.length - 1].id;
    }
    terminal.activeHeading = current;

    if (article) {
      const rect = article.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      terminal.progress = span <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / span));
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    terminal.headings = [];
    terminal.activeHeading = null;
    terminal.progress = null;
  };
};
