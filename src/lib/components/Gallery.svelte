<script lang="ts">
  import type { ImageData } from "$lib/types";
  import { Masonry } from "@nicbat/svelte-masonry";
  import { tick } from "svelte";
  import { gsap } from "gsap";
  import { RotateCcw, X } from "lucide-svelte";
  import ProgressiveImage from "$components/ProgressiveImage.svelte";

  let { images = [], padded = true }: { images?: ImageData[]; padded?: boolean } = $props();

  /*
   * Every photo is a polaroid print. The frame is built entirely from proportions of the print's
   * own width (padding %, strip height in cqw), so a tile and the zoomed-in card are the same shape
   * at any size — which is what lets the open/close animation be a pure translate + scale + rotate
   * (FLIP) from the tile's box to the card's and back, with nothing reflowing mid-flight.
   */
  const PAD = 0.045; // side/top border, as a fraction of print width
  const STRIP = 0.15; // bottom strip, as a fraction of print width (matches `15cqw` below)
  const printHeight = (width: number, ar: number) =>
    width * (PAD + (1 - 2 * PAD) / ar + STRIP);

  // A stable little tilt per photo (−2.2°…2.2°) so the grid reads as prints tossed on a table,
  // but never reshuffles between renders.
  function tiltOf(key: string): number {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    return ((((h >>> 0) % 1000) / 1000) * 2 - 1) * 2.2;
  }

  const aspect = (img: ImageData) => (img.width > 0 && img.height > 0 ? img.width / img.height : 1);

  // ---- lightbox -----------------------------------------------------------------------------

  let selected = $state<ImageData | null>(null);
  let flipped = $state(false);
  let cardSize = $state({ w: 0, h: 0 });

  let overlayEl = $state<HTMLDivElement>();
  let backdropEl = $state<HTMLDivElement>();
  let cardEl = $state<HTMLButtonElement>();
  let innerEl = $state<HTMLDivElement>();
  let chromeEl = $state<HTMLDivElement>();

  let originTile: HTMLElement | null = null;
  let closing = false;

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Largest card that fits the viewport, leaving room for the hint underneath.
  function fitCard(img: ImageData) {
    const ar = aspect(img);
    const maxW = Math.min(window.innerWidth - 32, 760);
    const maxH = window.innerHeight * 0.86 - 56;
    const w = Math.max(160, Math.min(maxW, maxH / (printHeight(1, ar))));
    return { w, h: printHeight(w, ar) };
  }

  // Transform that puts the (untransformed, centred) card exactly over `tile`.
  function tileTransform(tile: HTMLElement) {
    const card = cardEl!.getBoundingClientRect();
    const t = tile.getBoundingClientRect(); // rotated AABB — but its centre is the true centre
    // The tile's live transform (resting tilt, or straightened + lifted while hovered).
    const m = new DOMMatrix(getComputedStyle(tile).transform);
    return {
      x: t.left + t.width / 2 - (card.left + card.width / 2),
      y: t.top + t.height / 2 - (card.top + card.height / 2),
      // offsetWidth is the untransformed width; fold the tile's own scale back in.
      scale: (tile.offsetWidth * Math.hypot(m.a, m.b)) / card.width,
      rotation: (Math.atan2(m.b, m.a) * 180) / Math.PI,
    };
  }

  let scrollLock = { overflow: "", paddingRight: "" };
  function lockScroll(on: boolean) {
    const html = document.documentElement;
    if (on) {
      scrollLock = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
      const bar = window.innerWidth - html.clientWidth; // keep the page from shifting sideways
      html.style.overflow = "hidden";
      if (bar > 0) html.style.paddingRight = `${bar}px`;
    } else {
      html.style.overflow = scrollLock.overflow;
      html.style.paddingRight = scrollLock.paddingRight;
    }
  }

  async function open(image: ImageData, tile: HTMLElement) {
    if (selected) return;
    originTile = tile;
    closing = false;
    flipped = false;
    cardSize = fitCard(image);
    selected = image;
    lockScroll(true);
    await tick();
    if (!cardEl || !innerEl) return;

    cardEl.focus({ preventScroll: true });
    gsap.set(innerEl, { rotationY: 0 });

    if (reducedMotion()) {
      gsap.fromTo([backdropEl!, cardEl, chromeEl!], { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }

    const from = tileTransform(tile);
    tile.style.visibility = "hidden"; // the print is "picked up" off the table
    gsap.fromTo(backdropEl!, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(chromeEl!, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.35 });
    gsap.fromTo(
      cardEl,
      { ...from },
      { x: 0, y: 0, scale: 1, rotation: from.rotation * -0.35, duration: 0.65, ease: "expo.out" },
    );
  }

  function close() {
    if (!selected || closing) return;
    closing = true;
    const tile = originTile;
    const done = () => {
      if (tile) tile.style.visibility = "";
      selected = null;
      flipped = false;
      closing = false;
      lockScroll(false);
      tile?.focus({ preventScroll: true });
    };

    gsap.killTweensOf([cardEl!, innerEl!, backdropEl!, chromeEl!]);

    if (reducedMotion() || !tile || !cardEl) {
      gsap.to([backdropEl!, cardEl!, chromeEl!], { opacity: 0, duration: 0.15, onComplete: done });
      return;
    }

    // Measure against the card's resting box: momentarily clear the transform, read, restore.
    const current = gsap.getProperty(cardEl, "rotation") as number;
    gsap.set(cardEl, { x: 0, y: 0, scale: 1, rotation: 0 });
    const to = tileTransform(tile);
    gsap.set(cardEl, { rotation: current });

    gsap.to(chromeEl!, { opacity: 0, duration: 0.15 });
    gsap.to(backdropEl!, { opacity: 0, duration: 0.45, ease: "power2.in" });
    gsap.to(innerEl!, { rotationY: 0, duration: 0.45, ease: "power2.inOut" });
    gsap.to(cardEl, { ...to, duration: 0.5, ease: "power3.inOut", onComplete: done });
  }

  function flip() {
    if (!innerEl || closing) return;
    flipped = !flipped;
    if (reducedMotion()) {
      gsap.set(innerEl, { rotationY: flipped ? 180 : 0 });
      return;
    }
    // The print lifts slightly as it turns over, then settles.
    gsap
      .timeline()
      .to(innerEl, { rotationY: flipped ? 180 : 0, duration: 0.75, ease: "power3.inOut" }, 0)
      .to(innerEl, { scale: 1.04, duration: 0.375, ease: "power2.out" }, 0)
      .to(innerEl, { scale: 1, duration: 0.375, ease: "power2.in" }, 0.375);
  }

  function onKeydown(e: KeyboardEvent) {
    if (!selected) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function onResize() {
    if (selected && !closing) cardSize = fitCard(selected);
  }

  function onOverlayClick(e: MouseEvent) {
    // Clicks on the card flip it (its own handler); anywhere else on the overlay puts it back.
    if (cardEl?.contains(e.target as Node)) return;
    close();
  }
</script>

<svelte:window onkeydown={onKeydown} onresize={onResize} />

<div class:p-4={padded}>
  <Masonry
    items={images}
    getKey={(item) => item.src}
    heightEstimate={(item, cw) => printHeight(cw, aspect(item))}
    minColumnWidth={260}
    gap={22}
  >
    {#snippet children(item)}
      {@const tilt = tiltOf(item.src)}
      {@const label = item.title ?? item.caption}
      <button
        class="gallery-item tile"
        style="--tilt: {tilt}deg"
        aria-label={item.alt}
        onclick={(e) => open(item, e.currentTarget)}
      >
        <div class="print">
          <div class="photo" style="aspect-ratio: {aspect(item)}">
            <!-- Tiles render the compressed derivative; the lightbox below keeps the original. -->
            <img src={item.thumb?.src ?? item.src} alt={item.alt} loading="lazy" />
          </div>
          <div class="strip font-mono">
            {#if label}<span>{label}</span>{/if}
          </div>
        </div>
      </button>
    {/snippet}
  </Masonry>
</div>

{#if selected}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    bind:this={overlayEl}
    class="lightbox fixed inset-0 z-50"
    role="dialog"
    aria-modal="true"
    aria-label={selected.title ?? selected.alt}
    tabindex="-1"
    onclick={onOverlayClick}
  >
    <div bind:this={backdropEl} class="backdrop" aria-hidden="true"></div>

    <div class="stage">
      <button
        bind:this={cardEl}
        class="card"
        style="width: {cardSize.w}px; height: {cardSize.h}px"
        aria-label={flipped ? "Flip back to the photo" : "Flip over to read the back"}
        aria-pressed={flipped}
        onclick={flip}
      >
        <div bind:this={innerEl} class="card-inner">
          <div class="face front" aria-hidden={flipped}>
            <div class="print">
              <div class="photo" style="aspect-ratio: {aspect(selected)}">
                <!-- The tile's derivative is already cached, so it paints instantly; the original
                     fades in over it once downloaded. -->
                <ProgressiveImage
                  src={selected.src}
                  thumb={selected.thumb?.src}
                  alt={selected.alt}
                  class="h-full w-full object-cover"
                  fill
                />
              </div>
              <div class="strip font-mono">
                {#if selected.title ?? selected.caption}
                  <span>{selected.title ?? selected.caption}</span>
                {/if}
              </div>
            </div>
          </div>

          <div class="face back" aria-hidden={!flipped}>
            <div class="back-paper">
              <div class="back-head">
                {#if selected.title}
                  <h2 class="back-title">{selected.title}</h2>
                {/if}
                {#if selected.place || selected.year}
                  <p class="stamp font-mono">
                    {[selected.place, selected.year].filter(Boolean).join(" · ")}
                  </p>
                {/if}
              </div>
              {#if selected.description}
                <p class="back-note">{selected.description}</p>
              {:else}
                <p class="back-note empty">Nothing written on the back of this one — yet.</p>
              {/if}
              <p class="back-mark font-mono" aria-hidden="true">nicb.at</p>
            </div>
          </div>
        </div>
      </button>

      <div bind:this={chromeEl} class="chrome">
        <p class="hint font-mono" aria-hidden="true">
          <RotateCcw size={13} />
          {flipped ? "tap to flip back" : "tap to flip"}
        </p>
      </div>
    </div>

    <button class="close" aria-label="Close" onclick={close}>
      <X size={20} />
    </button>
  </div>
{/if}

<style>
  /* ---- the print (shared by tile + card) ---- */
  .print {
    container-type: inline-size;
    width: 100%;
    padding: 4.5% 4.5% 0;
    background: #fdfdf9; /* always a white print, even in dark mode — it's an object */
    box-shadow:
      0 1px 3px rgb(35 43 32 / 0.12),
      0 8px 20px rgb(35 43 32 / 0.08);
    transition: box-shadow 300ms ease;
  }

  .photo {
    width: 100%;
    overflow: hidden;
    background: #e9e8df;
  }

  .photo img,
  .photo :global(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .strip {
    height: 15cqw;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4cqw;
    /* Fixed (not themed): the print is always light. ~5.5:1 on #fdfdf9. */
    color: #61685b;
    font-size: clamp(0.7rem, 3.9cqw, 1.15rem);
    letter-spacing: 0.04em;
  }

  .strip span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ---- tile ---- */
  .tile {
    display: block;
    width: 100%;
    cursor: pointer;
    transform: rotate(var(--tilt));
    transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1);
    border-radius: 2px;
  }

  .tile:hover,
  .tile:focus-visible {
    transform: rotate(0deg) translateY(-4px) scale(1.015);
  }

  .tile:hover .print,
  .tile:focus-visible .print {
    box-shadow:
      0 4px 10px rgb(35 43 32 / 0.14),
      0 18px 36px rgb(35 43 32 / 0.14);
  }

  .tile:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }

  /* One full-width column on phones: a gentler tilt so corners don't kiss the screen edge. */
  @media (max-width: 639px) {
    .tile {
      transform: rotate(calc(var(--tilt) * 0.45));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tile,
    .tile:hover,
    .tile:focus-visible {
      transition: none;
      transform: rotate(var(--tilt));
    }
  }

  :global(.dark) .print {
    box-shadow:
      0 1px 3px rgb(0 0 0 / 0.45),
      0 8px 20px rgb(0 0 0 / 0.35);
  }

  /* ---- lightbox ---- */
  .lightbox {
    display: grid;
    place-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--color-overlay-light);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .stage {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    pointer-events: none; /* only the card is clickable; the rest falls through to "close" */
  }

  .card {
    display: block;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
    perspective: 2600px;
    will-change: transform;
    -webkit-tap-highlight-color: transparent;
  }

  .card:focus-visible {
    outline: none;
  }

  .card:focus-visible .print,
  .card:focus-visible .back-paper {
    outline: 2px solid var(--color-primary);
    outline-offset: 6px;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card .print {
    height: 100%;
    box-shadow:
      0 6px 16px rgb(35 43 32 / 0.18),
      0 30px 60px rgb(35 43 32 / 0.22);
  }

  :global(.dark) .card .print,
  :global(.dark) .back-paper {
    box-shadow:
      0 6px 16px rgb(0 0 0 / 0.5),
      0 30px 60px rgb(0 0 0 / 0.5);
  }

  .back {
    transform: rotateY(180deg);
  }

  /* The back of a photo print: warm paper, a date stamp, a note, a faint maker's mark. */
  .back-paper {
    container-type: inline-size;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: clamp(1rem, 7cqw, 2.5rem);
    background-color: #f6f2e7;
    box-shadow:
      0 6px 16px rgb(35 43 32 / 0.18),
      0 30px 60px rgb(35 43 32 / 0.22);
    color: #2c3328;
    text-align: left;
    overflow-y: auto;
    font-size: clamp(0.95rem, 3.4cqw, 1.15rem);
    line-height: 1.7;
  }

  .back-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.25rem 1rem;
  }

  .back-title {
    margin: 0;
    font-size: 1.25em;
    line-height: 1.3;
    font-weight: 600;
    color: #232b20;
  }

  /* Like the orange date a film camera burns into the corner. */
  .stamp {
    margin: 0;
    font-size: 0.75em;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b4532a;
  }

  /* Ruled like a notecard; the rules sit on the note's own line boxes, so text lands on them. */
  .back-note {
    flex: 1;
    margin: 0;
    white-space: pre-line;
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(1.7em - 1px),
      rgb(97 104 91 / 0.14) calc(1.7em - 1px),
      rgb(97 104 91 / 0.14) 1.7em
    );
    background-attachment: local;
  }

  .back-note.empty {
    color: #7a8073;
    font-style: italic;
  }

  .back-mark {
    margin: auto 0 0;
    align-self: flex-end;
    font-size: 0.7em;
    letter-spacing: 0.2em;
    color: rgb(97 104 91 / 0.55);
  }

  .chrome {
    pointer-events: none;
  }

  .hint {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
  }

  .close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 150ms;
  }

  .close:hover,
  .close:focus-visible {
    color: var(--color-primary);
  }
</style>
