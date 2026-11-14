<script lang="ts">
  import { RefreshCcw } from "lucide-svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import StickyNote from "$lib/components/StickyNote.svelte";
  import NoteViewer from "$lib/components/NoteViewer.svelte";
  import QuoteDisplay from "$lib/components/QuoteDisplay.svelte";
  import PrintTile from "$lib/components/PrintTile.svelte";
  import PhotoViewer from "$lib/components/PhotoViewer.svelte";
  import { tiltOf } from "$lib/polaroid";
  import { noteTilt, pileOffset } from "$lib/stickyNote";
  import type { ImageData } from "$lib/types";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let quoteComponent = $state<QuoteDisplay>();

  // The profile photo is the same print as the gallery's, square-cropped. Without a Globals photo
  // it falls back to the bundled static image.
  let mePhoto = $derived<ImageData>(
    data.homePhoto ?? { src: "home_photo.png", alt: "Me!", width: 1, height: 1, thumb: null },
  );
  let meViewer = $state<PhotoViewer>();
  let meTile: HTMLElement | null = null;

  // Featured projects are stuck up front; everything else waits in the pile, which is the link to
  // /projects (where the same notes spread out into a grid, see the Flip in +layout.svelte).
  let featured = $derived(data.projects.filter((p) => p.featured));
  // Reversed so the first of the rest ends up on top of the pile.
  let pile = $derived(data.projects.filter((p) => !p.featured).reverse());
  let noteViewer = $state<NoteViewer>();
</script>

<div class="home-page mx-auto w-full">
  <section class="home-hero flex flex-col gap-5 md:pt-6">
    <!-- Grid areas: phone stacks name → polaroid → intro; md+ puts the polaroid
         beside the name and intro (see .hero-top below). -->
    <div class="hero-top">
      <h1 class="home-title mb-0 font-semibold">Hey, it's Nicholas</h1>

      <!-- Profile photo: the same print as the gallery (subtle tilt, straightens on hover, opens to
           zoom and flip), always leaning the far end of the subtle range. Square-cropped. -->
      <div class="polaroid">
        <PrintTile
          image={mePhoto}
          tilt={tiltOf("me", -1)}
          ratio={1}
          onopen={(tile) => {
            meTile = tile;
            meViewer?.open(0, tile);
          }}
        />
      </div>

      <!-- Intro — authored in media manager as the newest posts/home/*.md -->
      {#if data.introHtml}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div
          class="home-intro markdown-content text-lg md:text-xl leading-relaxed text-primary-text"
        >
          {@html data.introHtml}
        </div>
      {/if}
    </div>

    <!-- Quote: its own quiet line under the intro, with refresh beside it -->
    <!-- Top-aligned so a wrapped quote keeps its gap from the rule. pt-3 puts a single
         line where centering against the 44px button used to (44 - 20) / 2 = 12px. -->
    <figure
      class="home-quote m-0 mt-2 pt-1 border-t border-primary flex items-start gap-1"
    >
      <div class="flex-1 min-w-0 pt-3">
        <QuoteDisplay bind:this={quoteComponent} />
      </div>
      <button
        class="quote-refresh relative group"
        aria-label="New quote"
        onclick={() => quoteComponent?.setRandomQuote()}
      >
        <RefreshCcw size={16} />
        <span
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
          style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
        >
          New quote
        </span>
      </button>
    </figure>
  </section>

  <section aria-labelledby="home-projects" class="mt-16">
    <h2 id="home-projects">Projects</h2>
    <p class="mb-6 text-secondary-text">
      Here's a few of the things I'm working on in my free time.
    </p>
    <div class="featured-notes">
      {#each featured as project (project.id)}
        <div class="featured-slot">
          <StickyNote
            {project}
            tilt={noteTilt(project.id)}
            onopen={(note) => noteViewer?.open(project, note)}
          />
        </div>
      {/each}
    </div>
    {#if pile.length}
      <a class="note-pile" href="/projects" aria-label="See all projects">
        <span class="pile-label font-mono" aria-hidden="true">see all →</span>
        <span class="pile" aria-hidden="true">
          {#each pile as project (project.id)}
            {@const at = pileOffset(project.id)}
            <span class="pile-note" style="left: {at.x}px; top: {at.y}px">
              <StickyNote {project} tilt={noteTilt(project.id, "pile")} />
            </span>
          {/each}
        </span>
      </a>
    {/if}
  </section>

  <section aria-labelledby="home-photos" class="mt-16 mb-8">
    <h2 id="home-photos">Photos</h2>
    <p class="mb-6 text-secondary-text">
      A few of my favorite shots from the last couple of years. See the rest of
      them <a href="/photos">here</a>.
    </p>
    <Gallery images={data.favorites} padded={false} />
  </section>
</div>

<NoteViewer bind:this={noteViewer} />

<PhotoViewer bind:this={meViewer} images={[mePhoto]} getTile={() => meTile} ratio={1} />

<style>
  .home-page {
    /* Shared width for the intro, projects, and photos. 56rem = 896px. */
    max-width: 56rem;
  }

  .home-title {
    font-size: 2rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  @media (min-width: 768px) {
    .home-title {
      font-size: 3.25rem;
      letter-spacing: -0.025em;
    }
  }

  .hero-top {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "title" "photo" "intro";
    row-gap: 1.25rem;
  }

  .hero-top > .home-title {
    grid-area: title;
  }

  .hero-top > .polaroid {
    grid-area: photo;
    justify-self: center;
    margin: 0.5rem 0 0.25rem;
  }

  .hero-top > .home-intro {
    grid-area: intro;
  }

  @media (min-width: 768px) {
    .hero-top {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas: "title photo" "intro photo";
      grid-template-rows: auto 1fr;
      column-gap: 4rem;
      align-items: start;
    }

    .hero-top > .polaroid {
      align-self: center;
      margin: 0 0.5rem 0 0;
    }
  }

  /* Profile print: the shared Print at a fixed width; every other measurement scales from it. */
  .polaroid {
    width: 232px;
  }

  /* Projects: three featured notes in a row, the pile of the rest below on the right. On phones the
     featured notes swipe sideways (each 80% wide, snapping) and the pile sits centered below. */
  .featured-notes {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.75rem;
  }

  .note-pile {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1.25rem;
    margin-top: 2.25rem;
    width: max-content;
    margin-left: auto;
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .pile-label {
    font-size: 1rem;
    transform: rotate(-3deg);
  }

  .pile {
    position: relative;
    display: block;
    width: 10.5rem;
    aspect-ratio: 1;
  }

  .pile-note {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  /* Only the top note casts a full shadow; thirteen stacked shadows read as a dark smudge. */
  .pile-note:not(:last-child) :global(.note) {
    filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.14));
  }

  .note-pile:hover .pile-label,
  .note-pile:focus-visible .pile-label {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .note-pile:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 8px;
  }

  @media (max-width: 639px) {
    .featured-notes {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 1.1rem;
      /* Bleed to the screen edges so the next note peeks in; room for shadows top and bottom. */
      margin: -0.75rem -1.25rem 0;
      padding: 1.25rem 1.25rem 2rem;
      scrollbar-width: none;
    }

    .featured-notes::-webkit-scrollbar {
      display: none;
    }

    .featured-slot {
      flex: 0 0 80%;
      scroll-snap-align: center;
    }

    .note-pile {
      margin: 0.5rem auto 0;
    }

    .pile {
      width: 8.5rem;
    }
  }

  /* Markdown intro: paragraph rhythm matching the hand-written markup it replaced. */
  .home-intro :global(p) {
    margin-bottom: 0;
  }

  .home-intro :global(p + p) {
    margin-top: 1.5rem;
  }

  /* Aside convention: a blockquote (`> …`) in home.md renders as a small secondary note —
     how the "now page" pointer and the P.S. keep their quieter styling in plain markdown. */
  .home-intro :global(blockquote) {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    margin-top: 1rem;
  }

  .home-intro :global(blockquote p + p) {
    margin-top: 0.75rem;
  }

  /* 44px tap target; icon follows text color, accent on hover/focus. */
  .quote-refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 150ms;
  }

  .quote-refresh:hover,
  .quote-refresh:focus-visible {
    color: var(--color-primary);
  }
</style>
