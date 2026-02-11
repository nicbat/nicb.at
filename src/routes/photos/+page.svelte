<script lang="ts">
  import Gallery from "$lib/components/Gallery.svelte";
  import type { ImageData } from "$lib/types";

  export let data: { images: ImageData[] };

  let images: ImageData[] = data.images;
</script>

<!-- TODO: load photos in lower quality by default, and have a slider/button/diff page to load them in higher quality -->
<div class="flex-1 mx-auto w-full px-5 flex flex-col max-w-3xl">
  <h1 class="mb-4">Photos</h1>
  <p class="mb-6 text-secondary-text">
    Here's a collection of some of my favorite photos.
  </p>
</div>
<!-- These photos may be loading slow, but (I think) LLMs aren't able to read them (yet)! 🥳</p> -->
<div class="flex-1 mx-auto w-full px-5 flex flex-col max-w-5xl">
  <Gallery {images} />
</div>
