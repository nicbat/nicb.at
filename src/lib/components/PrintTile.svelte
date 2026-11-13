<script lang="ts">
  /**
   * A print lying on the table: subtly tilted, it straightens and lifts on hover, and opens in
   * PhotoViewer on click. Used by the masonry Gallery and by the home-page profile photo, so both
   * behave identically.
   */
  import type { ImageData } from "$lib/types";
  import Print from "$components/Print.svelte";

  let {
    image,
    tilt,
    ratio,
    lazy = false,
    class: className = "",
    onopen,
  }: {
    image: ImageData;
    /** Resting rotation in degrees (see `tiltOf`). */
    tilt: number;
    ratio?: number;
    lazy?: boolean;
    class?: string;
    onopen: (tile: HTMLElement) => void;
  } = $props();
</script>

<button
  class="tile {className}"
  style="--tilt: {tilt}deg"
  aria-label={image.alt}
  onclick={(e) => onopen(e.currentTarget)}
>
  <Print {image} {ratio} {lazy} />
</button>

<style>
  .tile {
    display: block;
    width: 100%;
    padding: 0;
    cursor: pointer;
    transform: rotate(var(--tilt));
    transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .tile:hover,
  .tile:focus-visible {
    transform: rotate(0deg) translateY(-4px) scale(1.015);
  }

  .tile:hover :global(.print),
  .tile:focus-visible :global(.print) {
    box-shadow:
      0 4px 10px rgb(35 43 32 / 0.16),
      0 18px 36px rgb(35 43 32 / 0.16);
  }

  :global(.dark) .tile:hover :global(.print),
  :global(.dark) .tile:focus-visible :global(.print) {
    box-shadow:
      0 4px 10px rgb(0 0 0 / 0.5),
      0 18px 36px rgb(0 0 0 / 0.45);
  }

  .tile:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .tile,
    .tile:hover,
    .tile:focus-visible {
      transition: none;
      transform: rotate(var(--tilt));
    }
  }
</style>
