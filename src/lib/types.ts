export interface ImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
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
