<!-- src/routes/blog/+page.svelte -->
<script>
    export let data;
</script>

<div class="prose dark:prose-invert max-w-none">
  <h1>Some Writing of Mine</h1>
  <p>You might see that this page runs at <i>nicb.at/blog</i> – I don't consider myself consistent enough of a write 
  to be someone who has a <i>blog</i>. Maybe that'll change. I intend on writing – but for now, it'll happen when it happens.</p>
  <br/>

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
