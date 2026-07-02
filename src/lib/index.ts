// place files you want to import through the `$lib` alias in this folder.
import type { ImageData, Trip, TripSummary } from '$lib/types';
import type { Project, Quote } from './types';
import type { MMRecord } from 'media-manager/reader/vite';
// TODO: switch the `media-manager` dependency in package.json from `file:../media-manager`
// to a GitHub dependency (e.g. `"media-manager": "github:type-a-group/media-manager#<tag>"`)
// Caveat: git install requires media-manager's `prepare` script to build `dist/reader/` on
// install (currently only `prepublishOnly` builds it). Either update media-manager's prepare
// script or publish the reader as its own package (media-manager FUTURE_CHANGES Item 44).
import { MediaManager } from 'media-manager/reader/vite';

export const fetchMarkdownPosts = async () => {
  const allPostFiles = import.meta.glob('$assets/blog/*.md');
  const iterablePostFiles = Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      const { metadata } = await (resolver as () => Promise<{ metadata: any }>)();
      const postPath = '/words' + path.slice(16, -3);

      return {
        meta: metadata,
        path: postPath
      };
    })
  );

  return allPosts;
};

// Load the media-manager workspace once, at build time, from its on-disk file-first layout.
// Two Vite globs: the JSON (parsed) and the asset files (?url so Vite hashes + serves them). The
// reader does the manifest join, asset resolution, and normalization — see `media-manager/reader`.
const mm = MediaManager.load({
  data: import.meta.glob('$assets/media_manager/**/*.json', { eager: true, import: 'default' }),
  files: import.meta.glob('$assets/media_manager/media/files/*', {
    eager: true,
    query: '?url',
    import: 'default'
  })
});

interface UrlValue {
  display_name: string;
  url: string;
}

export const fetchImageList = async (): Promise<ImageData[]> => {
  return mm
    .media('photos')
    .where({ hidden: false })
    .map((m) => {
      const name = (m.field('name') as string) || '';
      const location = (m.field('Location') as string) || '';
      const year = (m.field('Year') as string) || '';
      const alt =
        `${name}${location ? '. ' + location : ''}${year ? ', ' + year : ''}`.trim() || m.filename;
      return { src: m.src ?? '', alt, width: m.width, height: m.height };
    })
    .filter((img) => img.src);
};

export const fetchHomePhoto = async (): Promise<ImageData | null> => {
  const photo = mm.globals()?.file('my photo');
  if (!photo?.src) return null;
  return { src: photo.src, alt: 'Me!', width: photo.width, height: photo.height };
};

export const fetchProjects = async (): Promise<Project[]> => {
  return mm
    .records('projects')
    .sortBy('date', 'desc')
    .map((r) => ({
      title: (r.field('name') as string) ?? '',
      date: (r.field('date') as string) ?? '',
      tags: ((r.field('tags') as string[]) ?? []) as Project['tags'],
      links: ((r.field('urls') as UrlValue[]) ?? []).map((u) => ({
        text: u.display_name,
        url: u.url
      })),
      image: '',
      description: (r.field('description') as string) ?? ''
    }));
};

// A trip's URL is its `html_route` when set, else a slug derived from its name.
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const tripSlug = (r: MMRecord): string =>
  ((r.field('html_route') as string) || '').trim() || slugify((r.field('name') as string) || '');

// Cover for a tile: the `cover_photo` field, else the first photo, else null.
const tripCover = (r: MMRecord): ImageData | null => {
  const cover = r.file('cover_photo') ?? r.files('photos').first();
  if (!cover?.src) return null;
  return {
    src: cover.src,
    alt: (cover.field('name') as string) || (r.field('name') as string) || '',
    width: cover.width,
    height: cover.height
  };
};

export const fetchTrips = async (): Promise<TripSummary[]> => {
  return mm
    .records('trips')
    .map((r) => ({
      slug: tripSlug(r),
      name: (r.field('name') as string) ?? '',
      cover: tripCover(r),
      startDate: (r.field('start_date') as string) ?? '',
      endDate: (r.field('end_date') as string) ?? ''
    }))
    // Newest first by start date; trips without a date sort to the end.
    .sort((a, b) => {
      if (a.startDate === b.startDate) return 0;
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return b.startDate.localeCompare(a.startDate);
    });
};

export const fetchTrip = async (slug: string): Promise<Trip | null> => {
  const r = mm.records('trips').find((rec) => tripSlug(rec) === slug);
  if (!r) return null;

  const photos = r
    .files('photos')
    .map((m) => ({
      src: m.src ?? '',
      alt: (m.field('name') as string) || '',
      width: m.width,
      height: m.height
    }))
    .filter((img) => img.src);

  return {
    slug,
    name: (r.field('name') as string) ?? '',
    description: (r.field('description') as string) ?? '',
    startDate: (r.field('start_date') as string) ?? '',
    endDate: (r.field('end_date') as string) ?? '',
    photos
  };
};

export const fetchQuotes = async (): Promise<Quote[]> => {
  return mm.records('quotes').map((r) => ({
    quote: (r.field('quote') as string) ?? '',
    author: (r.field('author') as string) ?? '',
    source: (r.field('source') as string) ?? '',
    show_on_homepage: (r.field('show_on_homepage') as boolean) ?? false,
    english_translation: (r.field('english_translation') as string) || undefined
  }));
};
