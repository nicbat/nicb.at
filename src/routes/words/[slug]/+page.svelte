<script lang="ts">
    import { onMount } from "svelte";
    import { enhancePosts } from "media-manager/reader/posts-enhancer";

    let { data } = $props();
    const { title, html } = data;

    let contentContainer = $state<HTMLElement>();

    // The reader ships rendered HTML with Shiki-highlighted code blocks; this adds a Copy
    // button to each one (idempotent, no-op on the server).
    onMount(() => enhancePosts(contentContainer));
</script>

<article
    class="prose dark:prose-invert max-w-none"
    bind:this={contentContainer}
>
    <h1>{title}</h1>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html html}
</article>
