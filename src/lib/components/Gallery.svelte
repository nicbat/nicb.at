<script lang="ts">
  import type { ImageData } from '$lib/types';
  import Masonry from 'svelte-bricks'
  
  export let images: ImageData[] = [];
  let selectedImage: ImageData | null = null;
  
  function openLightbox(image: ImageData): void {
    selectedImage = image;
  }
  
  function closeLightbox(): void {
    selectedImage = null;
  }
  //{#each images as image, i}
  //{/each}

  function getId(item: ImageData): string | number {
    return item.src;
  }
</script>

<Masonry
  items={images}
  idKey="src"
  let:item
  minColWidth={300}
  gap={12}
>
  <div class="gallery-item" on:click={() => openLightbox(item)}>
    <img src={item.src} alt={item.alt} loading="lazy" />
  </div>
</Masonry>

{#if selectedImage}
  <div class="lightbox" on:click={closeLightbox}>
    <img src={selectedImage.src} alt={selectedImage.alt} />
  </div>
{/if}

<style>
  /*.gallery {*/
  /*  display: flex;*/
  /*  flex-flow: column wrap;*/
  /*  gap: 16px;*/
  /*  height: 900px;*/
  /*  padding: 16px;*/
  /*}*/
  /**/
  .gallery-item {
    overflow: hidden;
    /*border-radius: 8px;*/
    cursor: pointer;
    transition: transform 0.3s ease;
    /*height: 300px;*/
    width: 100%;
  }

  .gallery-item:hover {
    transform: scale(1.02);
  }

  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .lightbox img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }
</style>
