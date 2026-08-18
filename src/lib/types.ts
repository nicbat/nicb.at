export interface ImageData {
  src: string;
  alt: string;
  /** Human-written caption shown on hover / in the lightbox. Absent when the photo is unnamed. */
  caption?: string;
  width: number;
  height: number;
  /**
   * The compressed derivative used for grid tiles, or null when this photo has none.
   *
   * The split is deliberate: `src`/`width`/`height` above always describe the **original** — that's
   * what a full-size view (lightbox, click-through) must load — while grids render `thumb` so a page
   * of tiles pulls the cheap bytes. Null when the preset wasn't generated for the blob (media-manager
   * skips files that don't shrink, e.g. a PNG that grows under re-encode); callers then fall back to
   * `src`. Dimensions come off the derivative itself, since a preset is free to resize.
   */
  thumb: { src: string; width: number; height: number } | null;
}

export type ProjectTag = 'Publication' | 'Product';

export interface ProjectLink {
  text: string;
  url: string;
}

export interface Project {
  title: string;
  date: string;
  tags: ProjectTag[];
  links: ProjectLink[];
  image: string;
  description: string;
}

export interface Quote {
  quote: string;
  author: string;
  source: string;
  show_on_homepage: boolean;
  english_translation?: string;
}

/** A trip as shown on the /travel index: a tile (cover + title) that links to its page. */
export interface TripSummary {
  slug: string;
  name: string;
  cover: ImageData | null;
  startDate: string;
  endDate: string;
}

/** A single trip page: title, description, and its masonry gallery. */
export interface Trip {
  slug: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  photos: ImageData[];
}
