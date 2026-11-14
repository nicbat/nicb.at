<script lang="ts">
  /**
   * A project as a sticky note: a mono title, the description, an optional photo taped on at both
   * top corners, and a gold star when it's featured. Its color comes from its tags (see
   * `$lib/stickyNote`).
   *
   * Every measurement is in `cqw` of the note's own width, so one note reads the same in the
   * home-page pile, the /projects grid and picked up in NoteViewer. That's also what lets the
   * pile → grid flight and the pick-up flight be a plain translate + scale.
   *
   * - With `onopen`, the note is a button that tilts on the page and straightens on hover, like a
   *   photo print. NoteViewer picks it up.
   * - Without it, it's inert: the notes in the home-page pile, inside the pile's link.
   * - `open` is the picked-up note: full description and real links.
   */
  import type { Project } from "$lib/types";
  import { flipId, inlineMarkdown, noteColor, noteStatus } from "$lib/stickyNote";

  let {
    project,
    tilt = 0,
    open = false,
    onopen,
  }: {
    project: Project;
    /** Resting rotation in degrees (see `noteTilt`). */
    tilt?: number;
    open?: boolean;
    onopen?: (note: HTMLElement) => void;
  } = $props();

  let color = $derived(noteColor(project));
  let status = $derived(noteStatus(project));
  let first = $derived(project.links[0]);
</script>

{#snippet body()}
  {#if project.featured}<span class="star" title="Featured"></span>{/if}
  <span class="title">{@html inlineMarkdown(project.title, { links: false })}</span>
  {#if project.image}
    <span class="photo">
      <span class="tape left"></span>
      <span class="tape right"></span>
      <img
        src={project.image.thumb?.src ?? project.image.src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </span>
  {/if}
  <span class="desc">{@html inlineMarkdown(project.description, { links: open })}</span>
  {#if open && project.links.length}
    <span class="links">
      {#each project.links as link (link.url)}
        <a href={link.url} target="_blank" rel="noopener noreferrer">→ {link.text}</a>
      {/each}
    </span>
  {/if}
  <span class="foot">
    <span>{status}</span>
    {#if !open && first}<span class="hint">{first.text.toLowerCase()} →</span>{/if}
  </span>
{/snippet}

<!-- The wrapper carries the Flip id and never animates in CSS, so GSAP can move it between pages
     while the note inside keeps its own tilt and hover transition. -->
<div class="note-wrap" data-flip-id={open ? undefined : flipId(project)}>
  {#if onopen}
    <button
      class="note {color}"
      class:has-photo={project.image}
      style="--tilt: {tilt}deg"
      aria-label={project.title}
      aria-haspopup="dialog"
      onclick={(e) => onopen(e.currentTarget)}
    >
      {@render body()}
    </button>
  {:else}
    <div class="note {color}" class:open class:has-photo={project.image} style="--tilt: {tilt}deg">
      {@render body()}
    </div>
  {/if}
</div>

<style>
  .note-wrap {
    position: relative;
    container-type: inline-size;
    width: 100%;
    aspect-ratio: 1;
  }

  /* Picked up: the note is in NoteViewer, and a faint mark stays where it was stuck. */
  .note-wrap:global(.picked) {
    background: rgb(35 43 32 / 0.05);
  }
  .note-wrap:global(.picked) > .note {
    visibility: hidden;
  }

  .note {
    --ink: #3a3524;
    --ink-soft: #6d6648;
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 2.5cqw;
    padding: 12cqw 8cqw 7cqw;
    text-align: left;
    color: var(--ink);
    font-family: var(--font-sans);
    cursor: default;
    background-color: var(--nc);
    /* Paper grain, the slightly darker glue strip along the top, and a soft sheen. */
    background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.2  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
      linear-gradient(to bottom, rgb(0 0 0 / 0.045) 0 9%, transparent 9.5%),
      linear-gradient(165deg, rgb(255 255 255 / 0.3), transparent 45%, rgb(0 0 0 / 0.04));
    filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.08)) drop-shadow(0 8px 9px rgb(35 43 32 / 0.26));
    transform: rotate(var(--tilt));
    transition:
      transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1),
      filter 300ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  button.note {
    cursor: pointer;
  }

  button.note:hover,
  button.note:focus-visible {
    transform: rotate(0deg) translateY(-4px) scale(1.015);
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.08)) drop-shadow(0 16px 16px rgb(35 43 32 / 0.26));
  }

  button.note:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }

  /* Paper isn't themed, but it dims a touch in dark mode so it doesn't glare, like the prints. */
  :global(.dark) .note {
    filter: brightness(0.9) drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))
      drop-shadow(0 8px 10px rgb(0 0 0 / 0.5));
  }

  .yellow {
    --nc: #f7e88f;
  }
  .pink {
    --nc: #f8c3cf;
  }
  .blue {
    --nc: #c0def3;
  }
  .green {
    --nc: #d0e9ad;
  }

  .star {
    position: absolute;
    top: 4.5cqw;
    right: 4.5cqw;
    width: 10cqw;
    height: 10cqw;
    background: linear-gradient(135deg, #f9da62, #d5a11c);
    clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    transform: rotate(-12deg);
  }

  .title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    padding-right: 12cqw;
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: clamp(0.92rem, 7.6cqw, 1.9rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
  }

  .desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 6;
    line-clamp: 6;
    overflow: hidden;
    font-size: clamp(0.7rem, 5.6cqw, 1.18rem);
    line-height: 1.32;
  }

  .has-photo .desc {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .open .desc {
    display: block;
  }

  /* A small print taped on at both top corners. */
  .photo {
    position: relative;
    display: block;
    flex: none;
    height: 34cqw;
    margin: 3cqw 2cqw 1cqw 3cqw;
    padding: 1.6cqw;
    background: #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
    transform: rotate(-2deg);
  }

  .open .photo {
    height: 36cqw;
  }

  .photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tape {
    position: absolute;
    top: -0.6cqw;
    width: 15cqw;
    height: 5cqw;
    background: rgb(240 232 200 / 0.78);
    box-shadow: 0 0.3cqw 0.6cqw rgb(0 0 0 / 0.1);
    z-index: 1;
  }

  .tape.left {
    left: -4.5cqw;
    transform: rotate(-36deg);
  }

  .tape.right {
    right: -4.5cqw;
    transform: rotate(38deg);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 2cqw 5cqw;
    font-size: clamp(0.8rem, 5.6cqw, 1.15rem);
  }

  .links a,
  .desc :global(a) {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
  }

  .foot {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 2cqw;
    margin-top: auto;
    font-size: clamp(0.62rem, 4.6cqw, 0.95rem);
    color: var(--ink-soft);
  }

  .hint {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .note,
    button.note:hover,
    button.note:focus-visible {
      transition: none;
      transform: rotate(var(--tilt));
    }
  }
</style>
