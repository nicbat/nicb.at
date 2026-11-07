<script lang="ts">
  import {
    Mail,
    Github,
    Linkedin,
    RefreshCcw,
    Icon,
    type IconNode,
  } from "lucide-svelte";
  import { elephantFace } from "@lucide/lab";
  import Gallery from "$lib/components/Gallery.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import QuoteDisplay from "$lib/components/QuoteDisplay.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let emailHover = $state(false);
  let githubHover = $state(false);

  let linkedinHover = $state(false);
  let mastodonHover = $state(false);
  let robloxHover = $state(false);
  let syncHover = $state(false);

  let quoteComponent = $state<QuoteDisplay>();

  const robloxIcon: IconNode = [
    [
      "path",
      {
        d: "M41.2648,12.6719,14.7123,5.5572a1.666,1.666,0,0,0-2.04,1.178L5.5572,33.2877a1.666,1.666,0,0,0,1.178,2.04l26.5525,7.1147a1.666,1.666,0,0,0,2.04-1.178l7.1147-26.5525a1.666,1.666,0,0,0-1.178-2.04Z",
      },
    ],
    [
      "path",
      {
        d: "M29.3193,20.51l-8.1808-2.192a.5133.5133,0,0,0-.6287.3629l-2.192,8.1808a.5133.5133,0,0,0,.3629.6287l8.1808,2.192a.5133.5133,0,0,0,.6287-.3629l2.192-8.1808A.5133.5133,0,0,0,29.3193,20.51Z",
      },
    ],
  ];
</script>

<div class="home-page mx-auto w-full">
  <section class="home-hero">
    <div class="home-content flex flex-col gap-8 w-full">
      <!-- Header Section -->
      <div
        class="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-8 md:gap-12"
      >
        <div class="flex flex-col gap-4">
          <h1 class="text-5xl font-medium">Hey, it's Nicholas</h1>

          <div class="font-mono text-sm text-secondary-text">
            <!-- developer, sometimes other things -->
            <QuoteDisplay bind:this={quoteComponent} />
          </div>

          <div class="flex gap-4 items-center">
            <!-- Sync Quote -->
            <button
              class="transition-transform hover:scale-110 relative group"
              aria-label="New Quote"
              onclick={() => quoteComponent?.setRandomQuote()}
              onmouseover={() => (syncHover = true)}
              onfocus={() => (syncHover = true)}
              onmouseout={() => (syncHover = false)}
              onblur={() => (syncHover = false)}
            >
              <RefreshCcw
                size={20}
                color={syncHover
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)"}
              />
              <!-- Tooltip -->
              <span
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
                style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
              >
                New Quote
              </span>
            </button>

            <!-- Divider -->
            <div
              class="w-px h-6 mx-1"
              style="background-color: var(--color-border-primary);"
            ></div>

            <!-- Email -->
            <a
              href="mailto:nicbatnicko@gmail.com"
              class="transition-transform hover:scale-110 relative group"
              aria-label="Email"
              onmouseover={() => (emailHover = true)}
              onfocus={() => (emailHover = true)}
              onmouseout={() => (emailHover = false)}
              onblur={() => (emailHover = false)}
            >
              <Mail
                size={20}
                color={emailHover
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)"}
              />
              <!-- Tooltip -->
              <span
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
                style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
              >
                Email me!
              </span>
            </a>

            <!-- Github -->
            <a
              href="https://github.com/nicbat"
              target="_blank"
              class="transition-transform hover:scale-110 relative group"
              aria-label="Github"
              onmouseover={() => (githubHover = true)}
              onfocus={() => (githubHover = true)}
              onmouseout={() => (githubHover = false)}
              onblur={() => (githubHover = false)}
            >
              <Github
                size={20}
                color={githubHover
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)"}
              />
              <!-- Tooltip -->
              <span
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
                style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
              >
                Github
              </span>
            </a>

            <!-- LinkedIn -->
            <a
              href="https://www.linkedin.com/in/nicholasbatchelder/"
              target="_blank"
              class="transition-transform hover:scale-110 relative group"
              aria-label="LinkedIn"
              onmouseover={() => (linkedinHover = true)}
              onfocus={() => (linkedinHover = true)}
              onmouseout={() => (linkedinHover = false)}
              onblur={() => (linkedinHover = false)}
            >
              <Linkedin
                size={20}
                color={linkedinHover
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)"}
              />
              <!-- Tooltip -->
              <span
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
                style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
              >
                LinkedIn
              </span>
            </a>

            <!-- Mastodon -->
            <a
              href="https://mastodon.social/@nicbat"
              target="_blank"
              class="transition-transform hover:scale-110 relative group"
              aria-label="Mastodon"
              onmouseover={() => (mastodonHover = true)}
              onfocus={() => (mastodonHover = true)}
              onmouseout={() => (mastodonHover = false)}
              onblur={() => (mastodonHover = false)}
            >
              <Icon
                iconNode={elephantFace}
                size={20}
                color={mastodonHover
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)"}
              />
              <!-- Tooltip -->
              <span
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
                style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
              >
                Mastodon
              </span>
            </a>

            <!-- Roblox -->
            <a
              href="https://www.roblox.com/users/35677096/profile"
              target="_blank"
              class="transition-transform hover:scale-110 relative group"
              aria-label="Roblox"
              onmouseover={() => (robloxHover = true)}
              onfocus={() => (robloxHover = true)}
              onmouseout={() => (robloxHover = false)}
              onblur={() => (robloxHover = false)}
            >
              <Icon
                iconNode={robloxIcon}
                viewBox="0 0 48 48"
                strokeWidth={4}
                size={20}
                color={robloxHover
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)"}
              />
              <!-- Tooltip -->
              <span
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm border"
                style="background-color: var(--color-bg-surface); color: var(--color-text-primary); border-color: var(--color-border-primary);"
              >
                Roblox
              </span>
            </a>
          </div>
        </div>

        <!-- Small avatar, never opened full size: take the compressed derivative when there is one. -->
        <img
          src={data.homePhoto?.thumb?.src ??
            data.homePhoto?.src ??
            "home_photo.png"}
          alt={data.homePhoto?.alt ?? "Me!"}
          class="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg transition-all duration-500 aspect-square"
        />
      </div>

      <!-- Content Section — authored in media manager as the newest posts/home/*.md -->
      {#if data.introHtml}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div
          class="home-intro markdown-content mt-8 text-lg leading-relaxed text-primary-text"
        >
          {@html data.introHtml}
        </div>
      {/if}
      <!-- <p class="text-sm text-secondary-text mb-0"> -->
      <!--   I also <a href="/words">write from time to time</a>. -->
      <!-- </p> -->
    </div>
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
    <h2 id="home-photos" class="mb-6">Photos</h2>
    <Gallery images={data.favorites} padded={false} />
  </section>
</div>

<style>
  .home-page {
    /* Shared width for the intro, projects, and photos. 56rem = 896px. */
    max-width: 56rem;
  }

  /* Markdown intro: paragraph rhythm matching the hand-written markup it replaced. */
  .home-intro :global(p + p) {
    margin-top: 1.5rem;
  }

  /* Aside convention: a blockquote (`> …`) in home.md renders as a small secondary note —
     how the "now page" pointer and the P.S. keep their quieter styling in plain markdown. */
  .home-intro :global(blockquote) {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    margin-top: 1.5rem;
  }

  .home-intro :global(blockquote p + p) {
    margin-top: 0.75rem;
  }
</style>
