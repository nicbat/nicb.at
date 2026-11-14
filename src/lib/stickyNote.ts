import type { Project } from '$lib/types';

/*
 * Projects are sticky notes. Everything here is derived from a project's own data, so a note never
 * reshuffles between renders or between the home page and /projects: its color comes from its tags,
 * its tilt and its place in the home-page pile from its record id.
 */

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green';

/** One color per kind of project, read from the tags the media manager already has. */
export function noteColor(p: Project): NoteColor {
  const tags = p.tags.map((t) => t.toLowerCase());
  if (tags.includes('publication')) return 'green';
  if (tags.some((t) => t === 'internship' || t === 'work' || t === 'client')) return 'blue';
  if (tags.includes('small')) return 'pink';
  return 'yellow';
}

/** The quiet line at the bottom of a note: "in progress" for WIP, else the year when there's a date. */
export function noteStatus(p: Project): string {
  if (p.tags.some((t) => t.toLowerCase() === 'wip')) return 'in progress';
  const year = /^\d{4}/.exec(p.date)?.[0];
  return year ?? '';
}

/** Matches across pages: GSAP Flip pairs the home-page note with the /projects note by this. */
export const flipId = (p: Pick<Project, 'id'>) => `note-${p.id}`;

function unit(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return ((h >>> 0) % 1000) / 1000;
}

/** Resting tilt in degrees: about ±2° on the board, barely-there ±2.5° in the pile. */
export function noteTilt(id: string, place: 'board' | 'pile' = 'board'): number {
  return (unit(id + place) * 2 - 1) * (place === 'pile' ? 2.5 : 2);
}

/** A note's small shuffle in the pile, in px, so the stack's edges don't line up. */
export function pileOffset(id: string): { x: number; y: number } {
  return { x: Math.round(unit(id + 'px') * 30 - 15), y: Math.round(unit(id + 'py') * 20 - 10) };
}

/**
 * The media manager's light inline markdown (`**bold**`, `*italic*`, `[text](url)`) to HTML.
 * Pass `links: false` inside a closed note, which is itself a button: the link text stays but it
 * isn't a nested link. The picked-up note shows real links.
 */
export function inlineMarkdown(text: string, { links = true } = {}): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, label: string, url: string) =>
      links ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>` : label
    );
}
