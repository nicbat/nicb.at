<script lang="ts">
  import type { ImageData } from "$lib/types";
  import { Masonry } from "@nicbat/svelte-masonry";

  let { images = [] }: { images?: ImageData[] } = $props();
  let selectedImage = $state<ImageData | null>(null);
  let hoveredImage = $state<ImageData | null>(null);

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
  <Masonry
    items={images}
    getKey={(item) => item.src}
    aspectRatio={(item) => item.width / item.height}
    minColumnWidth={300}
    gap={12}
    footerEstimate={0}
  >
    {#snippet children(item)}
      <button
        class="gallery-item relative group transition-transform duration-300 ease-in-out hover:scale-[1.02] overflow-hidden cursor-pointer w-full block"
        onclick={() => openLightbox(item)}
        onmouseenter={() => showTooltip(item)}
        onmouseleave={hideTooltip}
      >
        {#if item.caption}
          <div
            class="absolute bottom-2 left-2 bg-overlay text-primary-text px-2 py-1 rounded text-sm transition-opacity ease-in-out duration-100 group-hover:opacity-100 opacity-0 z-10"
          >
            {item.caption}
          </div>
        {/if}
        <!-- Tiles render the compressed derivative; the lightbox below keeps the original. -->
        <img
          class="rounded-lg w-full h-auto block"
          src={item.thumb?.src ?? item.src}
          alt={item.alt}
          loading="lazy"
        />
      </button>
    {/snippet}
  </Masonry>
</div>

{#if selectedImage}
  <button
    class="fixed inset-0 bg-overlay-light flex flex-col justify-center items-center z-50"
    onclick={closeLightbox}
  >
    <!-- Full size: always the untouched original, never the compressed tile derivative. -->
    <img
      class="max-w-[90%] max-h-[90%] object-contain rounded-lg"
      src={selectedImage.src}
      alt={selectedImage.alt}
    />
    {#if selectedImage.caption}
      <p class="text-primary-text text-lg mt-4">{selectedImage.caption}</p>
    {/if}
  </button>
{/if}
