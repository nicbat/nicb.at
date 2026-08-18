// place files you want to import through the `$lib` alias in this folder.
import type { ImageData, Trip, TripSummary } from '$lib/types';
import type { Project, Quote } from './types';
import type { MediaItem, MMRecord, PostItem } from 'media-manager/reader/vite';
// TODO: switch the `media-manager` dependency in package.json from `file:../media-manager`
// to a GitHub dependency (e.g. `"media-manager": "github:nicbat/media-manager#<tag>"`)
// Caveat: git install requires media-manager's `prepare` script to build `dist/reader/` on
// install (currently only `prepublishOnly` builds it). Either update media-manager's prepare
// script or publish the reader as its own package (media-manager FUTURE_CHANGES Item 44).
import { MediaManager } from 'media-manager/reader/vite';

// A rendered post's finished HTML plus its frontmatter, resolved by the media-manager reader.
export interface Post {
  meta: Record<string, unknown>;
  html: string;
}

// A words post's URL slug: its `html_route` frontmatter when set, else the `.md` filename stem.
// Mirrors how a trip resolves its route (see `tripSlug`).
const postRoute = (p: PostItem): string =>
  ((p.meta.html_route as string) || '').trim() || p.slug;

// A post is public only when `published` frontmatter is explicitly true. The field defaults to
// false in the schema, so a post that's absent/false is hidden — no listing and no route (404).
const isPublished = (p: PostItem): boolean => p.meta.published === true;

// The published `words` posts, newest-first (`.all()` already sorts by frontmatter `date` desc).
// Only metadata + route are needed for the index — the body HTML is fetched per-post on demand.
export const fetchMarkdownPosts = async () => {
  return mm.posts('words').all()
    .filter(isPublished)
    .map((p) => ({
      meta: p.meta,
      path: '/words/' + postRoute(p)
    }));
};

// One published `words` post by its route (`html_route` or filename stem), or null if unknown /
// unpublished (so an unpublished post's URL 404s just like a nonexistent one).
export const fetchPost = async (route: string): Promise<Post | null> => {
  const post = mm.posts('words').all().find((p) => isPublished(p) && postRoute(p) === route);
  if (!post) return null;
  return { meta: post.meta, html: post.html };
};

// A post's sort key as an ISO date: its frontmatter `date` when set, else a date read from the
// `.md` filename stem (`260817` or `2026-08-17`), so a post is ordered correctly whether it's dated
// in the frontmatter, in its name, or both. Undatable posts sort last.
const postDate = (p: PostItem): string => {
  const meta = p.meta.date != null ? String(p.meta.date).trim() : '';
  if (meta) return meta;
  const digits = p.slug.replace(/\D/g, '');
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  if (digits.length === 6) return `20${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  return '';
};

// The newest post of a single-page collection (`now`, `home`), or null when it holds no posts.
// Writing a new dated `.md` in the collection is what publishes it — the previous ones stay put as
// an archive. `.all()` is already date desc; the reduce also honours a date carried in the filename.
const latestPost = (collection: string): Post | null => {
  const posts = mm.posts(collection).all();
  if (posts.length === 0) return null;
  const latest = posts.reduce((newest, p) => (postDate(p) > postDate(newest) ? p : newest));
  return { meta: latest.meta, html: latest.html };
};

// The most recent `now` post (the newest of posts/now/*.md), or null if the collection is empty.
export const fetchNow = async (): Promise<Post | null> => latestPost('now');

// The home page's intro blurb — the newest of posts/home/*.md, or null if the collection is empty
// (the home page then renders without an intro rather than erroring).
export const fetchHome = async (): Promise<Post | null> => latestPost('home');

// Load the media-manager workspace once, at build time, from its on-disk file-first layout.
// Two Vite globs: the JSON (parsed) and the Posts markdown (?raw so each `.md` arrives as a string for
// the reader to render). Blobs are NOT globbed — the workspace is in static-assets mode (config
// `assets: { dir: './static/media', baseUrl: '/media' }`), so the reader synthesizes each blob's URL
// from the manifest as `/media/<file_name>` and the binaries are served straight from `static/media/`
// instead of being bundled into the function. The `!**/google.json` exclusion keeps the Google Photos
// OAuth secret out of the client bundle. The reader does the manifest join, asset resolution, markdown
// rendering, and normalization — see `media-manager/reader`.
const mm = MediaManager.load(
  {
    data: import.meta.glob(['$assets/media_manager/**/*.json', '!**/google.json'], {
      eager: true,
      import: 'default'
    }),
    posts: import.meta.glob('$assets/media_manager/posts/**/*.md', {
      eager: true,
      query: '?raw',
      import: 'default'
    })
  },
  {
    // Static-assets mode: blobs served from /media/<file>, not bundled (see static/media/).
    assets: { baseUrl: '/media' },
    // Match the site's existing Shiki theme for fenced code (see svelte.config.js).
    posts: { theme: 'catppuccin-mocha' }
  }
);

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
      const caption = `${name}${location ? '. ' + location : ''}${
        year ? ', ' + year : ''
      }`.trim();
      return {
        src: m.src ?? '',
        alt: caption || m.filename,
        caption: caption || undefined,
        width: m.width,
        height: m.height
      };
    })
    .filter((img) => img.src);
};

// A blob reached through a reference (e.g. `trip.files('photos')`) is *blob-level*: its `fields` are
// empty, because one blob can belong to several classes with differing metadata. The per-photo
// `name` lives on the class view, so index each class view by blob id (once, lazily) and look the
// metadata up through that.
const classMetaLookup = (classId: string) => {
  let index: Map<string, MediaItem> | null = null;
  return (id: string): MediaItem | null => {
    index ??= new Map(mm.media(classId).map((m) => [m.id, m]));
    return index.get(id) ?? null;
  };
};

const travelMeta = classMetaLookup('travel');
const photoMeta = classMetaLookup('photos');

// A trip photo's caption: its travel-class `name` (trip-specific), else its photos-class `name`.
const photoCaption = (m: MediaItem): string =>
  (
    (travelMeta(m.id)?.field('name') as string) ||
    (photoMeta(m.id)?.field('name') as string) ||
    ''
  ).trim();

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
  const caption = photoCaption(cover);
  return {
    src: cover.src,
    alt: caption || (r.field('name') as string) || '',
    caption: caption || undefined,
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

  const tripName = (r.field('name') as string) ?? '';
  const photos = r
    .files('photos')
    .map((m) => {
      const caption = photoCaption(m);
      return {
        src: m.src ?? '',
        alt: caption || tripName || m.filename,
        caption: caption || undefined,
        width: m.width,
        height: m.height
      };
    })
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
