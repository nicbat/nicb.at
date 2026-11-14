<script lang="ts">
  /**
   * A sticky note picked up off the page. `open(project, note)` flies a full-size copy of the note
   * from its spot to the middle of the screen with GSAP, leaving a faint mark behind. Picked up, it
   * shows the whole description and every link. Escape, the "stick it back" button, or a tap
   * anywhere but a link flies it back to its spot.
   *
   * The same flight as PhotoViewer's prints: the note on the page and the picked-up note are one
   * note at two sizes (everything in it is sized in `cqw`), so it's a plain translate + scale +
   * rotate.
   */
  import type { Project } from "$lib/types";
  import { tick } from "svelte";
  import { gsap } from "gsap";
  import StickyNote from "$components/StickyNote.svelte";

  let project = $state<Project | null>(null);
  let cardEl = $state<HTMLDivElement>();
  let backdropEl = $state<HTMLDivElement>();
  let backEl = $state<HTMLButtonElement>();

  let tile: HTMLElement | null = null; // the note on the page that was picked up
  let closing = false;

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Transform that puts the (untransformed, centred) card exactly over `el`.
  function tileTransform(el: HTMLElement) {
    const card = cardEl!.getBoundingClientRect();
    const t = el.getBoundingClientRect(); // rotated box, but its centre is the true centre
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return {
      x: t.left + t.width / 2 - (card.left + card.width / 2),
      y: t.top + t.height / 2 - (card.top + card.height / 2),
      scale: (el.offsetWidth * Math.hypot(m.a, m.b)) / card.width,
      rotation: (Math.atan2(m.b, m.a) * 180) / Math.PI,
    };
  }

  let scrollLock = { overflow: "", paddingRight: "" };
  function lockScroll(on: boolean) {
    const html = document.documentElement;
    if (on) {
      scrollLock = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
      const bar = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      if (bar > 0) html.style.paddingRight = `${bar}px`;
    } else {
      html.style.overflow = scrollLock.overflow;
      html.style.paddingRight = scrollLock.paddingRight;
    }
  }

  export async function open(p: Project, from: HTMLElement) {
    if (project) return;
    tile = from;
    closing = false;
    project = p;
    lockScroll(true);
    await tick();
    if (!cardEl) return;
    cardEl.focus({ preventScroll: true });

    if (reducedMotion()) {
      from.parentElement?.classList.add("picked");
      gsap.fromTo([backdropEl!, cardEl, backEl!], { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }

    const start = tileTransform(from);
    from.parentElement?.classList.add("picked");
    gsap.fromTo(backdropEl!, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(backEl!, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.4 });
    gsap.fromTo(
      cardEl,
      { ...start },
      { x: 0, y: 0, scale: 1, rotation: -1.5, duration: 0.6, ease: "power3.out" },
    );
  }

  function close() {
    if (!project || closing) return;
    closing = true;
    const home = tile;
    const done = () => {
      home?.parentElement?.classList.remove("picked");
      project = null;
      closing = false;
      lockScroll(false);
      home?.focus({ preventScroll: true });
    };

    gsap.killTweensOf([cardEl!, backdropEl!, backEl!]);

    if (reducedMotion() || !home || !cardEl) {
      gsap.to([backdropEl!, cardEl!, backEl!], { opacity: 0, duration: 0.15, onComplete: done });
      return;
    }

    // Measure against the card's resting box: clear the transform, read, restore.
    const current = gsap.getProperty(cardEl, "rotation") as number;
    gsap.set(cardEl, { x: 0, y: 0, scale: 1, rotation: 0 });
    const to = tileTransform(home);
    gsap.set(cardEl, { rotation: current });

    gsap.to(backEl!, { opacity: 0, duration: 0.15 });
    gsap.to(backdropEl!, { opacity: 0, duration: 0.45, ease: "power2.in" });
    // Shrinks back down on top of the dimmed page, then the real note reappears in its spot.
    gsap.to(cardEl, { ...to, duration: 0.55, ease: "power3.inOut", onComplete: done });
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") close();
  }}
/>

{#if project}
  <div class="viewer" role="dialog" aria-modal="true" aria-label={project.title}>
    <div class="backdrop" bind:this={backdropEl} onclick={close} aria-hidden="true"></div>
    <!-- Tapping the note (anywhere but a link) puts it back. Keyboard users have Escape and the
         "stick it back" button. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="card"
      bind:this={cardEl}
      tabindex="-1"
      onclick={(e) => {
        if (!(e.target as Element).closest("a")) close();
      }}
    >
      <StickyNote {project} open />
    </div>
    <button class="back font-mono" bind:this={backEl} onclick={close}>stick it back</button>
  </div>
{/if}

<style>
  .viewer {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 1rem;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: rgb(15 20 15 / 0.5);
  }

  .card {
    position: relative;
    width: min(26rem, calc(100vw - 2rem));
    outline: none;
    cursor: pointer;
  }

  .back {
    position: absolute;
    left: 50%;
    bottom: max(1.25rem, env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    padding: 0.5rem 0.9rem;
    font-size: 0.9rem;
    color: #f1f1e9;
    cursor: pointer;
  }

  .back:hover,
  .back:focus-visible {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
