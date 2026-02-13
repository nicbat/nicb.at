<!-- src/routes/blog/+page.svelte -->
<script>
    export let data;
</script>

<div class="prose dark:prose-invert max-w-none">
    <h1>Words</h1>
    <p class="mb-6 text-secondary-text">Here are some of my thoughts.</p>

    {#each data.posts as post}
        <h2>
            <a href={post.path}>
                {post.meta.title}
            </a>
        </h2>
        {post.meta.description}
    {/each}
</div>
