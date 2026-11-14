<script lang="ts">
  import Gallery from "$lib/components/Gallery.svelte";
  import type { ImageData } from "$lib/types";

  let { data }: { data: { images: ImageData[] } } = $props();

  let images: ImageData[] = data.images;
</script>

<!-- TODO: load photos in lower quality by default, and have a slider/button/diff page to load them in higher quality -->
<div class="flex flex-col max-w-3xl">
  <h1>Photos</h1>
  <p class="page-lede">
    Here's a set of some of my favorite photos.
  </p>
</div>
<!-- These photos may be loading slow, but (I think) LLMs aren't able to read them (yet)! 🥳</p> -->
<div class="flex flex-col">
  <Gallery {images} padded={false} />
</div>
