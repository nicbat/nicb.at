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

  // Tab across, not down. Each masonry column is its own DOM container, so native Tab order runs down
  // column 1, then column 2. Photos are placed left to right in index order, so stepping by index
  // follows the rows you see. Past either end, focus jumps to the tile that's last (or first) in DOM
  // order and the Tab carries on from there, leaving the gallery as usual.
  function onkeydown(e: KeyboardEvent) {
    if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey) return;
    const from = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (!from || !rootEl) return;
    const i = Number(from.dataset.index);
    const next = getTile(i + (e.shiftKey ? -1 : 1));
    if (next) {
      e.preventDefault();
      next.focus();
      return;
    }
    const tiles = rootEl.querySelectorAll<HTMLElement>("[data-index] .tile");
    const edge = e.shiftKey ? tiles[0] : tiles[tiles.length - 1];
    if (edge && edge !== document.activeElement) edge.focus();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (keydown only reroutes Tab between tiles) -->
<div bind:this={rootEl} class:p-4={padded} {onkeydown}>
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
