<script lang="ts">
  import type { ImageData } from '$lib/types';
  import Masonry from 'svelte-bricks'
  
  export let images: ImageData[] = [];
  let selectedImage: ImageData | null = null;
  let hoveredImage: ImageData | null = null;
  
  function openLightbox(image: ImageData): void {
    selectedImage = image;
  }
  
  function closeLightbox(): void {
    selectedImage = null;
  }

  function showTooltip(image: ImageData): void {
    hoveredImage = image;
  }

  function hideTooltip(): void {
    hoveredImage = null;
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
  <button 
    class="gallery-item relative group transition-transform duration-300 ease-in-out hover:scale-[1.02] overflow-hidden cursor-pointer w-full" 
    on:click={() => openLightbox(item)} 
    on:mouseenter={() => showTooltip(item)} 
    on:mouseleave={hideTooltip}
  >
    <div class="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm transition-opacity ease-in-out duration-100 group-hover:opacity-100 opacity-0 z-10">
      {item.alt}
    </div>
    <img class="rounded-lg w-full h-full object-cover" src={item.src} alt={item.alt} loading="lazy" />
  </button>
</Masonry>

{#if selectedImage}
  <button 
    class="fixed inset-0 bg-black/80 flex justify-center items-center z-50" 
    on:click={closeLightbox}
  >
    <img class="max-w-[90%] max-h-[90%] object-contain rounded-lg" src={selectedImage.src} alt={selectedImage.alt} />
  </button>
{/if}
