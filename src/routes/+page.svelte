<script lang="ts">
  import { RefreshCcw } from "lucide-svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import QuoteDisplay from "$lib/components/QuoteDisplay.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let quoteComponent = $state<QuoteDisplay>();
</script>

<div class="home-page mx-auto w-full">
  <section class="home-hero flex flex-col gap-5 md:pt-6">
    <!-- Grid areas: phone stacks name → polaroid → intro; md+ puts the polaroid
         beside the name and intro (see .hero-top below). -->
    <div class="hero-top">
      <h1 class="home-title mb-0 font-semibold">Hey, it's Nicholas</h1>

      <!-- Small photo, never opened full size: take the compressed derivative when there is one. -->
      <figure class="polaroid">
        <img
          src={data.homePhoto?.thumb?.src ??
            data.homePhoto?.src ??
            "home_photo.png"}
          alt={data.homePhoto?.alt ?? "Me!"}
        />
        <!-- TODO: read this from a "my photo caption" string field on the media-manager
             Globals record (next to "my photo") via /api/home-photo; hide when empty. -->
        <figcaption class="font-mono">Snow Lake, 2024</figcaption>
      </figure>

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
      Here's a few of the things I'm working on in my free time. See my other
      projects <a href="/projects">here</a>.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each data.projects as project (project.title + project.date)}
        <ProjectCard {project} />
      {/each}
    </div>
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

  /* Polaroid: square photo, thick bottom strip with a mono caption, slight tilt.
     Stays a white print in dark mode too — it's an object on the page. */
  .polaroid {
    width: max-content;
    padding: 9px 9px 0;
    background: #fdfdf9;
    box-shadow:
      0 2px 6px rgb(35 43 32 / 0.14),
      0 12px 28px rgb(35 43 32 / 0.1);
    transform: rotate(-2deg);
  }

  .polaroid img {
    display: block;
    width: 168px;
    height: 168px;
    object-fit: cover;
    object-position: 50% 40%;
  }

  .polaroid figcaption {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    /* Fixed (not themed): the print is always light. ~5.5:1 on #fdfdf9. */
    color: #61685b;
  }

  @media (min-width: 768px) {
    .polaroid {
      padding: 10px 10px 0;
    }
    .polaroid img {
      width: 176px;
      height: 176px;
    }
    .polaroid figcaption {
      height: 44px;
    }
  }

  :global(.dark) .polaroid {
    box-shadow:
      0 2px 6px rgb(0 0 0 / 0.4),
      0 12px 28px rgb(0 0 0 / 0.35);
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
