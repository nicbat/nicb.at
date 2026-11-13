<script lang="ts">
  /**
   * The zoomed-in print. `open(index, tile)` lifts the print off the page (the tile hides) and
   * flies it to the centre with GSAP, FLIP-style: the card is laid out at its final size, then
   * animated from the tile's box. Tap the card to turn it over to the back; swipe, the arrow keys,
   * or the prev / next buttons move to the neighbouring photo; Escape, the close button, or the
   * backdrop fly it back into the spot of whichever photo is showing.
   *
   * Tile and card are the same print at two scales (see `$lib/polaroid`), so the flight is a pure
   * translate + scale + rotate and lands without a jump.
   */
  import type { ImageData } from "$lib/types";
  import { tick } from "svelte";
  import { gsap } from "gsap";
  import { ChevronLeft, ChevronRight, X } from "lucide-svelte";
  import Print from "$components/Print.svelte";
  import { aspect, printHeight } from "$lib/polaroid";

  let {
    images,
    getTile,
    ratio,
  }: {
    images: ImageData[];
    /** The on-page tile for an index, so the card can fly back to it (and hide it while open). */
    getTile: (index: number) => HTMLElement | null;
    /** Crop every print to this ratio instead of the photo's own (the home print is square). */
    ratio?: number;
  } = $props();

  let index = $state(-1);
  let flipped = $state(false);
  let cardSize = $state({ w: 0, h: 0 });
  let selected = $derived(index >= 0 ? (images[index] ?? null) : null);
  let browsable = $derived(images.length > 1);

  let backdropEl = $state<HTMLDivElement>();
  let cardEl = $state<HTMLButtonElement>();
  let innerEl = $state<HTMLDivElement>();
  let chromeEl = $state<HTMLDivElement>();

  let tile: HTMLElement | null = null; // the tile of the photo currently showing
  let closing = false;
  let busy = false; // mid prev/next swap
  let queued = 0; // net prev/next presses made mid-swap (+ next, − prev), played after it finishes

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ratioOf = (img: ImageData) => ratio ?? aspect(img);

  // The back's date stamp, like the orange date a film camera burns in: "'22 · ROME".
  let stamp = $derived(
    selected
      ? [selected.year && `'${selected.year.slice(-2)}`, selected.place?.toUpperCase()]
          .filter(Boolean)
          .join(" · ")
      : "",
  );

  // Largest card that fits the viewport, leaving room for the controls underneath.
  function fitCard(img: ImageData) {
    const ar = ratioOf(img);
    const maxW = Math.min(window.innerWidth - 32, 720);
    const maxH = window.innerHeight * 0.84 - 68;
    const w = Math.max(160, Math.min(maxW, maxH / printHeight(1, ar)));
    return { w, h: printHeight(w, ar) };
  }

  // Transform that puts the (untransformed, centred) card exactly over `el`.
  function tileTransform(el: HTMLElement) {
    const card = cardEl!.getBoundingClientRect();
    const t = el.getBoundingClientRect(); // rotated AABB, but its centre is the true centre
    // The tile's live transform: its resting tilt, or straightened + lifted while hovered.
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return {
      x: t.left + t.width / 2 - (card.left + card.width / 2),
      y: t.top + t.height / 2 - (card.top + card.height / 2),
      // offsetWidth is the untransformed width; fold the tile's own scale back in.
      scale: (el.offsetWidth * Math.hypot(m.a, m.b)) / card.width,
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

  export async function open(i: number, from: HTMLElement) {
    if (index >= 0 || !images[i]) return;
    tile = from;
    closing = busy = false;
    queued = 0;
    flipped = false;
    cardSize = fitCard(images[i]);
    index = i;
    lockScroll(true);
    await tick();
    if (!cardEl || !innerEl) return;

    cardEl.focus({ preventScroll: true });
    gsap.set(innerEl, { rotationY: 0, scale: 1 });

    if (reducedMotion()) {
      gsap.fromTo([backdropEl!, cardEl, chromeEl!], { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }

    const start = tileTransform(from);
    from.style.visibility = "hidden"; // the print is picked up off the page
    gsap.fromTo(backdropEl!, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(chromeEl!, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.35 });
    gsap.fromTo(
      cardEl,
      { ...start },
      { x: 0, y: 0, scale: 1, rotation: start.rotation * -0.35, duration: 0.65, ease: "expo.out" },
    );
  }

  function close() {
    if (index < 0 || closing) return;
    closing = true;
    const home = tile;
    const done = () => {
      if (home) home.style.visibility = "";
      index = -1;
      flipped = false;
      closing = busy = false;
      lockScroll(false);
      home?.focus({ preventScroll: true });
    };

    gsap.killTweensOf([cardEl!, innerEl!, backdropEl!, chromeEl!]);

    if (reducedMotion() || !home || !cardEl) {
      gsap.to([backdropEl!, cardEl!, chromeEl!], { opacity: 0, duration: 0.15, onComplete: done });
      return;
    }

    // Measure against the card's resting box: clear the transform, read, restore.
    const current = gsap.getProperty(cardEl, "rotation") as number;
    gsap.set(cardEl, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });
    const to = tileTransform(home);
    gsap.set(cardEl, { rotation: current });

    gsap.to(chromeEl!, { opacity: 0, duration: 0.15 });
    gsap.to(backdropEl!, { opacity: 0, duration: 0.45, ease: "power2.in" });
    gsap.to(innerEl!, { rotationY: 0, scale: 1, duration: 0.45, ease: "power2.inOut" });
    gsap.to(cardEl, { ...to, duration: 0.5, ease: "power3.inOut", onComplete: done });
  }

  function flip() {
    if (!innerEl || closing || busy) return;
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

  // Prev / next: the print slides off one side and the neighbour slides in from the other. The
  // hidden tile follows along, so closing returns the photo you're on to its own spot.
  async function go(dir: 1 | -1) {
    if (!browsable || index < 0 || closing || !cardEl || !innerEl) return;
    if (busy) {
      queued = Math.max(-3, Math.min(3, queued + dir)); // quick presses aren't dropped
      return;
    }
    busy = true;
    const next = (index + dir + images.length) % images.length;

    const swap = async () => {
      if (tile) tile.style.visibility = "";
      tile = getTile(next);
      flipped = false;
      cardSize = fitCard(images[next]);
      index = next;
      await tick();
      gsap.set(innerEl!, { rotationY: 0, scale: 1 });
      if (tile && !reducedMotion()) tile.style.visibility = "hidden";
    };

    const finish = () => {
      busy = false;
      if (queued) {
        const step = queued > 0 ? 1 : -1;
        queued -= step;
        go(step);
      }
    };

    if (reducedMotion()) {
      await swap();
      finish();
      return;
    }

    gsap.killTweensOf(cardEl);
    gsap.to(cardEl, {
      x: -dir * 90,
      opacity: 0,
      rotation: -dir * 5,
      duration: 0.2,
      ease: "power2.in",
      onComplete: async () => {
        await swap();
        gsap.fromTo(
          cardEl!,
          { x: dir * 90, opacity: 0, rotation: dir * 5, scale: 1 },
          {
            x: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.38,
            ease: "power3.out",
            onComplete: finish,
          },
        );
      },
    });
  }

  // Pointer handling on the card: a tap flips it, a sideways swipe browses.
  let drag = { down: false, moved: false, x0: 0, y0: 0, dx: 0 };

  function onPointerDown(e: PointerEvent) {
    if (busy || closing) return;
    drag = { down: true, moved: false, x0: e.clientX, y0: e.clientY, dx: 0 };
    cardEl?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!drag.down) return;
    drag.dx = e.clientX - drag.x0;
    const horizontal = Math.abs(drag.dx) > Math.abs(e.clientY - drag.y0);
    if (!drag.moved && Math.abs(drag.dx) > 8 && horizontal) drag.moved = true;
    if (drag.moved && browsable) gsap.set(cardEl!, { x: drag.dx * 0.7, rotation: drag.dx * 0.02 });
  }

  function onPointerUp() {
    if (!drag.down) return;
    drag.down = false;
    if (!drag.moved) return flip();
    if (!browsable) return;
    if (Math.abs(drag.dx) > 70) go(drag.dx < 0 ? 1 : -1);
    else gsap.to(cardEl!, { x: 0, rotation: 0, duration: 0.35, ease: "power3.out" });
  }

  // Keyboard Enter / Space on the card arrive as a click with no pointer (detail 0).
  function onCardClick(e: MouseEvent) {
    if (e.detail === 0) flip();
  }

  function onKeydown(e: KeyboardEvent) {
    if (index < 0) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  function onResize() {
    if (selected && !closing) cardSize = fitCard(selected);
  }

  function onOverlayClick(e: MouseEvent) {
    // The card and the arrow buttons handle their own clicks; anywhere else puts the print back.
    const target = e.target as Element;
    if (cardEl?.contains(target) || target.closest(".nav")) return;
    close();
  }
</script>

<svelte:window onkeydown={onKeydown} onresize={onResize} />

{#if selected}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
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
        onclick={onCardClick}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onpointercancel={onPointerUp}
      >
        <div bind:this={innerEl} class="card-inner">
          <div class="face front" aria-hidden={flipped}>
            <Print image={selected} {ratio} full />
          </div>

          <!-- The back of a lab print: maker's watermark, orange date stamp, a ruled note. -->
          <div class="face back" aria-hidden={!flipped}>
            <div class="paper font-mono">
              {#if stamp}<p class="stamp">{stamp}</p>{/if}
              <h2 class="back-title">{selected.backTitle ?? selected.title ?? selected.caption}</h2>
              {#if selected.description}
                <p class="back-note">{selected.description}</p>
              {:else}
                <p class="back-note empty">No note on the back of this one yet.</p>
              {/if}
            </div>
          </div>
        </div>
      </button>

      <div bind:this={chromeEl} class="controls" class:solo={!browsable}>
        {#if browsable}
          <button class="nav prev font-mono" aria-label="Previous photo" onclick={() => go(-1)}>
            <ChevronLeft size={14} />
            <span>prev</span>
          </button>
        {/if}
        <p class="hint font-mono" aria-hidden="true">
          {flipped ? "tap to flip back" : "tap to flip"}
        </p>
        {#if browsable}
          <button class="nav next font-mono" aria-label="Next photo" onclick={() => go(1)}>
            <span>next</span>
            <ChevronRight size={14} />
          </button>
        {/if}
      </div>
    </div>

    <button class="close" aria-label="Close" onclick={close}>
      <X size={20} />
    </button>
  </div>
{/if}

<style>
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
    pointer-events: none; /* only the card and controls take clicks; the rest falls through */
  }

  .card {
    display: block;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
    perspective: 2600px;
    will-change: transform;
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .card:focus-visible {
    outline: none;
  }

  .card:focus-visible .face :global(.print),
  .card:focus-visible .paper {
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

  .face :global(.print) {
    height: 100%;
    box-shadow:
      0 6px 16px rgb(35 43 32 / 0.2),
      0 30px 60px rgb(35 43 32 / 0.24);
  }

  .back {
    transform: rotateY(180deg);
  }

  /* Lab paper: always light, like the front. A faint repeating maker's mark, as on the back of a
     real photo-lab print. */
  .paper {
    container-type: inline-size;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: clamp(1rem, 7cqw, 2.4rem);
    background-color: #faf8f1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Ctext x='0' y='40' transform='rotate(-24 100 60)' font-family='monospace' font-size='11' letter-spacing='3' fill='%2361685b' fill-opacity='0.035'%3ENICB.AT PHOTO PAPER%3C/text%3E%3Ctext x='60' y='110' transform='rotate(-24 100 60)' font-family='monospace' font-size='11' letter-spacing='3' fill='%2361685b' fill-opacity='0.035'%3ENICB.AT PHOTO PAPER%3C/text%3E%3C/svg%3E");
    color: #2c3328;
    text-align: left;
    overflow-y: auto;
    font-size: clamp(0.95rem, 3.4cqw, 1.15rem);
    box-shadow:
      0 6px 16px rgb(35 43 32 / 0.2),
      0 30px 60px rgb(35 43 32 / 0.24);
  }

  :global(.dark) .face :global(.print),
  :global(.dark) .paper {
    box-shadow:
      0 6px 16px rgb(0 0 0 / 0.5),
      0 30px 60px rgb(0 0 0 / 0.5);
  }

  :global(.dark) .paper {
    background-color: #ecebe3;
  }

  .stamp {
    align-self: flex-end;
    margin: 0;
    font-weight: 700;
    font-size: 0.9em;
    letter-spacing: 0.12em;
    color: #e0662c;
    text-shadow: 0 0 4px rgb(240 120 50 / 0.4);
  }

  .back-title {
    margin: 0;
    font-size: 1.05em;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.02em;
    color: #232b20;
  }

  /* Ruled like a notecard; the rules sit on the note's own line boxes, so the text lands on them. */
  .back-note {
    flex: 1;
    margin: 0;
    font-size: 0.86em;
    line-height: 1.75em;
    white-space: pre-line;
    color: #3a4236;
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0 calc(1.75em - 1px),
      rgb(97 104 91 / 0.16) calc(1.75em - 1px) 1.75em
    );
    background-attachment: local;
  }

  .back-note.empty {
    font-style: italic;
    color: #8a9184;
  }

  /* "‹ prev   tap to flip   next ›", with the hint exactly centred under the print. */
  .controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.5rem;
    width: min(calc(100vw - 2rem), 22rem);
  }

  .controls.solo {
    display: flex;
    justify-content: center;
  }

  .hint {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
    text-align: center;
  }

  .nav {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 2.75rem;
    padding: 0 0.4rem;
    font-size: 0.78rem;
    line-height: 1;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 150ms;
  }

  .nav :global(svg) {
    display: block;
    flex: none;
  }

  .nav span {
    display: block;
    line-height: 1;
    padding-top: 1px;
  }

  .prev {
    justify-self: end;
  }

  .next {
    justify-self: start;
  }

  .nav:hover,
  .nav:focus-visible {
    color: var(--color-primary);
  }

  .nav:hover span {
    text-decoration: underline;
    text-underline-offset: 3px;
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
