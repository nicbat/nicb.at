<!-- src/routes/blog/+page.svelte -->
<script>
    export let data;
</script>

<div class="prose dark:prose-invert max-w-none">
  <h1>Blog</h1>

  {#each data.posts as post}
      <h2>
          <a href={post.path}>
              {post.meta.title}
          </a>
      </h2>
      <!-- Published {post.meta.date} -->
      {post.meta.description}
  {/each}
</div>
