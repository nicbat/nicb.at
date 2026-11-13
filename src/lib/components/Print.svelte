<script lang="ts">
  /**
   * One polaroid print: the photo in a white frame with the title printed on the bottom strip.
   * Rendered at any width — see `$lib/polaroid` for why every measurement is proportional.
   *
   * `full` swaps the plain thumbnail for ProgressiveImage, which paints the cached derivative and
   * fades the original in over it; grid tiles keep the cheap derivative only.
   */
  import type { ImageData } from "$lib/types";
  import ProgressiveImage from "$components/ProgressiveImage.svelte";
  import { aspect, stripFrac } from "$lib/polaroid";

  let {
    image,
    full = false,
    ratio,
    lazy = false,
  }: {
    image: ImageData;
    full?: boolean;
    /** Crop the photo to this width / height instead of its own (the home print is square). */
    ratio?: number;
    lazy?: boolean;
  } = $props();

  let ar = $derived(ratio ?? aspect(image));
  let label = $derived(image.title ?? image.caption);
</script>

<div class="print" style="--sf: {stripFrac(ar)}">
  <div class="photo" style="aspect-ratio: {ar}">
    {#if full}
      <ProgressiveImage
        src={image.src}
        thumb={image.thumb?.src}
        alt={image.alt}
        class="h-full w-full object-cover"
        fill
      />
    {:else}
      <img
        src={image.thumb?.src ?? image.src}
        alt={image.alt}
        loading={lazy ? "lazy" : undefined}
        draggable="false"
      />
    {/if}
  </div>
  <div class="strip font-mono">
    {#if label}<span>{label}</span>{/if}
  </div>
</div>

<style>
  .print {
    container-type: inline-size;
    width: 100%;
    padding: 4.5% 4.5% 0;
    /* An object on the page, so not themed like the UI — but a touch dimmer in dark mode so the
       prints don't glare against the forest-floor background. */
    background: #fdfdf9;
    box-shadow:
      0 1px 3px rgb(35 43 32 / 0.14),
      0 8px 20px rgb(35 43 32 / 0.1);
    transition: box-shadow 300ms ease;
  }

  :global(.dark) .print {
    background: #ecebe3;
    box-shadow:
      0 1px 3px rgb(0 0 0 / 0.45),
      0 8px 20px rgb(0 0 0 / 0.35);
  }

  .photo {
    width: 100%;
    overflow: hidden;
    background: #e2e1d8;
  }

  .photo img,
  .photo :global(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 40%;
    -webkit-user-drag: none;
  }

  /* Strip height and caption size are both cqw of this print: no px clamps, so the print keeps
     its proportions at every size. The caption shrinks with the strip on panoramas. */
  .strip {
    height: calc(var(--sf) * 100cqw);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4cqw;
    font-size: min(4.6cqw, calc(var(--sf) * 62cqw));
    letter-spacing: 0.04em;
    /* Fixed (not themed): the print is always light. ~5.5:1 on #fdfdf9. */
    color: #61685b;
  }

  :global(.dark) .strip {
    color: #5d6457;
  }

  .strip span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
