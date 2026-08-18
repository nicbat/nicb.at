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

  // ===== decorative background: layered mountains + drifting clouds =====
  const MW = 1200;
  const MH = 360;
  const mountains = (() => {
    const layers = 4;
    const baseAmp = MH * 0.09;
    const topMargin = MH * 0.12; // headroom so the tallest peak never clips flat
    const gap = MH * 0.13;
    const op = [0.1, 0.16, 0.24, 0.34];
    const out: { d: string; o: number }[] = [];
    for (let L = 0; L < layers; L++) {
      const amp = baseAmp * (1 - L * 0.12);
      const b = topMargin + 1.4 * amp + L * gap;
      const ph = L * 1.3;
      const y = (x: number) =>
        b + Math.sin(x / 150 + ph) * amp + Math.cos(x / 68 + ph) * amp * 0.4;
      let d = `M 0 ${y(0).toFixed(1)}`;
      for (let x = 0; x <= MW; x += 24) d += ` L ${x} ${y(x).toFixed(1)}`;
      d += ` L ${MW} ${y(MW).toFixed(1)} L ${MW} ${MH} L 0 ${MH} Z`;
      out.push({ d, o: op[L] });
    }
    return out;
  })();
</script>

<section class="home-hero">
  <div class="home-bg" aria-hidden="true">
    <svg class="mountains" viewBox="0 0 {MW} {MH}" preserveAspectRatio="none">
      {#each mountains as m}
        <path d={m.d} fill="var(--color-primary)" opacity={m.o} />
      {/each}
    </svg>
  </div>

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
        src={data.homePhoto?.thumb?.src ?? data.homePhoto?.src ?? "home_photo.png"}
        alt={data.homePhoto?.alt ?? "Me!"}
        class="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg transition-all duration-500 aspect-square"
      />
    </div>

    <!-- Content Section — authored in media manager as the newest posts/home/*.md -->
    {#if data.introHtml}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <div class="home-intro mt-8 text-lg leading-relaxed text-primary-text">
        {@html data.introHtml}
      </div>
    {/if}
  </div>
</section>

<style>
  /* hero fills the viewport so the footer sits below the fold */
  .home-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 5.5rem);
  }
  /* mountains pinned to the bottom of the viewport, full width, behind content */
  .home-bg {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: clamp(200px, 38vh, 420px);
    z-index: 0;
    pointer-events: none;
  }
  .mountains {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .home-content {
    position: relative;
    z-index: 1;
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
