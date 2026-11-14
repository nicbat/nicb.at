<script lang="ts">
    import { onMount } from "svelte";
    import { enhancePosts } from "media-manager/reader/posts-enhancer";
    import { trackHeadings } from "$lib/terminal/state.svelte";
    import { formatDayMonthYear } from "$lib/dates";

    let { data } = $props();

    let contentContainer = $state<HTMLElement>();

    // Frontmatter dates may arrive as `YYYY-MM-DD` or a full ISO timestamp; the day is what matters.
    const day = (d?: string) => (d ? formatDayMonthYear(String(d).slice(0, 10)) : "");
    let posted = $derived(day(data.date));
    let updated = $derived(day(data.updated));

    // The reader ships rendered HTML with Shiki-highlighted code blocks; this adds a Copy
    // button to each one (idempotent, no-op on the server).
    onMount(() => enhancePosts(contentContainer));

    // Hand this post's headings to the site terminal, which lists them and follows along as you
    // read. Re-runs when moving between posts, since the page component is reused.
    $effect(() => {
        data.html;
        return trackHeadings(data.headings, contentContainer);
    });

    // TODO(words, bring up later): older / newer post links at the end of a post. The site terminal
    // covers getting around, but a quiet "← older · newer →" after the last paragraph is still nice
    // once you've finished reading. Discussed and deferred by the owner; ask before building.
</script>

<article
    class="markdown-content max-w-none"
    bind:this={contentContainer}
>
    <h1>{data.title}</h1>
    {#if posted}
        <p class="post-dates">
            <time datetime={String(data.date).slice(0, 10)}>{posted}</time>
            {#if updated && updated !== posted}
                · updated <time datetime={String(data.updated).slice(0, 10)}>{updated}</time>
            {/if}
        </p>
    {/if}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html data.html}
</article>

<style>
    .post-dates {
        margin: -0.25rem 0 1.5rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }
</style>
