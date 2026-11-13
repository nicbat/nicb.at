import type { ImageData } from '$lib/types';

/*
 * Geometry of a polaroid print. Every part of the frame is a fraction of the print's width — the
 * border is `padding: 4.5%`, the strip and caption are `cqw` of the print's content box — with no px
 * minimums anywhere. So a 200px grid tile, the 230px home-page print and a 700px zoomed card are the
 * same print at different scales, which is what lets PhotoViewer animate between them with a pure
 * translate + scale + rotate and land without a jump.
 */

/** Border on the top and sides, as a fraction of print width. Matches `padding: 4.5%` in Print. */
export const PAD = 0.045;

/** width / height of an image, falling back to square when dimensions are missing. */
export const aspect = (img: Pick<ImageData, 'width' | 'height'>): number =>
  img.width > 0 && img.height > 0 ? img.width / img.height : 1;

/**
 * Bottom strip height as a fraction of the print's content width. 15% for ordinary photos; slimmer
 * for panoramas, whose strip would otherwise be half as tall as the photo itself.
 */
export const stripFrac = (ar: number): number => 0.15 * Math.min(1, 1.35 / ar);

/**
 * Rendered height of a print of the given width. The photo and the strip are both sized from the
 * content box inside the side borders, hence `(1 - 2 * PAD)` on both.
 */
export const printHeight = (width: number, ar: number): number =>
  width * (PAD + (1 - 2 * PAD) * (1 / ar + stripFrac(ar)));

/**
 * A stable, subtle tilt for a print (about ±1.1°), derived from a key so it never reshuffles
 * between renders. Pass `lean` to pin it to one end of the range instead.
 */
export function tiltOf(key: string, lean?: -1 | 1): number {
  if (lean) return lean * 1.1;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return ((((h >>> 0) % 1000) / 1000) * 2 - 1) * 1.1;
}
