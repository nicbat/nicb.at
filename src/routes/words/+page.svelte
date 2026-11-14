<script>
  let { data } = $props();
</script>

<div class="max-w-none">
  <h1>Words</h1>
  <p class="page-lede">Here are some of my thoughts.</p>

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
