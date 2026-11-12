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
    <!-- Name, with the small photo as a byline tile -->
    <div class="flex items-center gap-3.5 md:gap-5">
      <!-- Small avatar, never opened full size: take the compressed derivative when there is one. -->
      <img
        src={data.homePhoto?.thumb?.src ??
          data.homePhoto?.src ??
          "home_photo.png"}
        alt={data.homePhoto?.alt ?? "Me!"}
        class="home-avatar w-12 h-12 md:w-16 md:h-16 rounded-[11px] md:rounded-[14px] object-cover shrink-0"
      />
      <h1 class="home-title mb-0 font-semibold">Hey, it's Nicholas</h1>
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

    <!-- Quote: its own quiet line under the intro, with refresh beside it -->
    <!-- Top-aligned so a wrapped quote keeps its gap from the rule. pt-3 puts a single
         line where centering against the 44px button used to (44 - 20) / 2 = 12px. -->
    <figure
      class="m-0 mt-2 pt-1 border-t border-primary flex items-start gap-1"
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

  .home-avatar {
    object-position: 50% 40%;
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
