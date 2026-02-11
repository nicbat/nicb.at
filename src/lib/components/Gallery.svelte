<script lang="ts">
  import type { ImageData } from "$lib/types";
  import { BalancedMasonryGrid, Frame } from "@masonry-grid/svelte";

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
</script>

<div class="p-4">
  <BalancedMasonryGrid gap={12} frameWidth={300}>
    {#each images as item (item.src)}
      <Frame width={item.width} height={item.height}>
        <button
          class="gallery-item relative group transition-transform duration-300 ease-in-out hover:scale-[1.02] overflow-hidden cursor-pointer w-full h-full block"
          on:click={() => openLightbox(item)}
          on:mouseenter={() => showTooltip(item)}
          on:mouseleave={hideTooltip}
        >
          <div
            class="absolute bottom-2 left-2 bg-overlay text-primary-text px-2 py-1 rounded text-sm transition-opacity ease-in-out duration-100 group-hover:opacity-100 opacity-0 z-10"
          >
            {item.alt}
          </div>
          <img
            class="rounded-lg w-full h-full object-cover"
            src={item.src}
            alt={item.alt}
            loading="lazy"
          />
        </button>
      </Frame>
    {/each}
  </BalancedMasonryGrid>
</div>

{#if selectedImage}
  <button
    class="fixed inset-0 bg-overlay-light flex flex-col justify-center items-center z-50"
    on:click={closeLightbox}
  >
    <img
      class="max-w-[90%] max-h-[90%] object-contain rounded-lg"
      src={selectedImage.src}
      alt={selectedImage.alt}
    />
    <p class="text-primary-text text-lg mt-4">{selectedImage.alt}</p>
  </button>
{/if}
