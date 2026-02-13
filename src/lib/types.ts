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
