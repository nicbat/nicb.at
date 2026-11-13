<script lang="ts">
  import type { ImageData } from "$lib/types";
  import { Masonry } from "@nicbat/svelte-masonry";
  import PrintTile from "$components/PrintTile.svelte";
  import PhotoViewer from "$components/PhotoViewer.svelte";
  import { aspect, printHeight, tiltOf } from "$lib/polaroid";

  let { images = [], padded = true }: { images?: ImageData[]; padded?: boolean } = $props();

  let rootEl = $state<HTMLDivElement>();
  let viewer = $state<PhotoViewer>();

  // Masonry lays tiles out column by column, so find a tile by its index attribute, not DOM order.
  const getTile = (i: number) =>
    rootEl?.querySelector<HTMLElement>(`[data-index="${i}"] .tile`) ?? null;
</script>

<div bind:this={rootEl} class:p-4={padded}>
  <Masonry
    items={images}
    getKey={(item) => item.src}
    heightEstimate={(item, cw) => printHeight(cw, aspect(item))}
    minColumnWidth={260}
    gap={24}
  >
    {#snippet children(item)}
      {@const i = images.indexOf(item)}
      <div data-index={i}>
        <PrintTile
          image={item}
          tilt={tiltOf(item.src)}
          class="gallery-item"
          lazy
          onopen={(tile) => viewer?.open(i, tile)}
        />
      </div>
    {/snippet}
  </Masonry>
</div>

<PhotoViewer bind:this={viewer} {images} {getTile} />
