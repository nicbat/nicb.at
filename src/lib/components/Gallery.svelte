<script lang="ts">
  import type { ImageData } from "$lib/types";
  import { Masonry } from "@nicbat/svelte-masonry";
  import ProgressiveImage from "$components/ProgressiveImage.svelte";

  let { images = [], padded = true }: { images?: ImageData[]; padded?: boolean } = $props();
  let selectedImage = $state<ImageData | null>(null);

  function openLightbox(image: ImageData): void {
    selectedImage = image;
  }

  function closeLightbox(): void {
    selectedImage = null;
  }
</script>

<div class:p-4={padded}>
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
        aria-label={item.alt}
        onclick={() => openLightbox(item)}
      >
        {#if item.caption}
          <div
            role="tooltip"
            class="absolute bottom-2 left-2 bg-overlay text-primary-text px-2 py-1 rounded text-sm transition-opacity ease-in-out duration-100 group-hover:opacity-100 group-focus-visible:opacity-100 opacity-0 z-10"
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
    <!-- The tile's derivative is already cached, so it paints instantly; the untouched original
         fades in over it as soon as it has downloaded. -->
    <ProgressiveImage
      src={selectedImage.src}
      thumb={selectedImage.thumb?.src}
      alt={selectedImage.alt}
      class="max-w-[90vw] max-h-[90vh] object-contain"
      imgClass="rounded-lg"
    />
    {#if selectedImage.caption}
      <p class="text-primary-text text-lg mt-4">{selectedImage.caption}</p>
    {/if}
  </button>
{/if}
