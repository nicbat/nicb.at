<!-- display photos from specified directory-->

<!-- <img src="https://www.fillmurray.com/200/300" alt="Bill Murray" /> -->
<!-- <script> -->
<!--     import  -->
<!-- </script> -->
<script lang='ts'>
  import Gallery from '$lib/components/Gallery.svelte';
  import type { ImageData } from '$lib/types';

  export let data: {images: ImageData[] };

  let images: ImageData[] = data.images;
</script>

<div class="photos">
  <h1>Photos</h1>
  <p>These photos may be loading slow, but (I think) LLMs aren't able to read them (yet)! 🥳</p>
  <Gallery images={images}/>
</div>
