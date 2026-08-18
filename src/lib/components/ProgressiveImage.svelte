<script lang="ts">
  /**
   * A full-size image that paints its compressed derivative first and upgrades to the original
   * once that has downloaded.
   *
   * The point is perceived latency: a grid tile has already fetched `thumb`, so the placeholder
   * layer comes straight out of the browser cache and appears in the same frame as the click,
   * while the multi-megabyte original streams in behind it and cross-fades on top. Both layers
   * stay mounted — the thumb is never torn down — so a failed or slow original degrades to "the
   * compressed version, forever" rather than to an empty box.
   *
   * With no `thumb` (media-manager skips presets that don't shrink) this collapses to a plain
   * `<img>` of the original, which is exactly the old behaviour.
   */
  let {
    src,
    thumb = null,
    alt = "",
    class: className = "",
    imgClass = "",
  }: {
    /** The original — the image we ultimately want on screen. */
    src: string;
    /** Compressed derivative shown until `src` lands. Null/undefined renders `src` directly. */
    thumb?: string | null;
    alt?: string;
    /** Sizing classes. Applied to the placeholder, which is what gives the wrapper its box. */
    class?: string;
    /** Visual classes shared by both layers (rounding, shadows) — never sizing. */
    imgClass?: string;
  } = $props();

  let fullEl = $state<HTMLImageElement>();
  let fullLoaded = $state(false);

  // Re-evaluated whenever `src` changes, because the lightbox reuses one instance across photos:
  // the new original starts un-loaded, so the thumb must come back to the front. `complete` covers
  // the cached case, where the browser can finish the swap before `onload` is ever wired up.
  $effect(() => {
    src;
    fullLoaded = fullEl?.complete === true && fullEl.naturalWidth > 0;
  });
</script>

{#if thumb && thumb !== src}
  <!-- The wrapper shrink-wraps the placeholder, so the overlay's inset-0 lines up with it exactly. -->
  <div class="relative inline-block leading-none">
    <img class="block {className} {imgClass}" src={thumb} {alt} />
    <img
      bind:this={fullEl}
      class="absolute inset-0 block h-full w-full object-contain transition-opacity duration-300 {imgClass}"
      class:opacity-0={!fullLoaded}
      {src}
      alt=""
      aria-hidden="true"
      decoding="async"
      onload={() => (fullLoaded = true)}
    />
  </div>
{:else}
  <img class="block {className} {imgClass}" {src} {alt} />
{/if}
