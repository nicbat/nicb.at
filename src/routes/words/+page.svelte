<script>
  let { data } = $props();
</script>

<div class="max-w-none">
  <a href="/" class="mb-6 inline-block text-sm">Back to home</a>
  <h1>Words</h1>
  <p class="mb-6 text-secondary-text">Here are some of my thoughts.</p>

  <div class="flex flex-col gap-4">
    {#each data.posts as post}
      <article>
        <h2>
          <a href={post.path}>
            {post.meta.title}
          </a>
        </h2>
        {#if post.meta.description}
          <p class="mb-0 leading-relaxed">{post.meta.description}</p>
        {/if}
      </article>
    {/each}
  </div>
</div>
