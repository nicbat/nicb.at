// place files you want to import through the `$lib` alias in this folder.
import type { ImageData } from '$lib/types';
import type { Project, Quote } from './types';

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

function filenameWithLowercaseExt(name: string): string {
  return name.replace(/\.[^.]+$/, (ext) => ext.toLowerCase());
}

export const fetchImageList = async (): Promise<ImageData[]> => {
  try {
    const imageData = await import('$assets/media_manager/photos/image-data.json');
    const imagesFromJson = (imageData.default?.images ?? []) as Array<{
      file_name: string;
      image_name: string;
      Location: string;
      Year: string;
      hidden: boolean;
      width: number;
      height: number;
    }>;

    const allImageFiles = import.meta.glob('$assets/media_manager/photos/files/*.{jpg,jpeg,png,gif}');
    const resolvedSrcByFilename: Record<string, string> = {};
    await Promise.all(
      Object.entries(allImageFiles).map(async ([path, resolver]) => {
        const { default: src } = await (resolver as () => Promise<{ default: string }>)();
        const filename = path.split('/').pop() || '';
        resolvedSrcByFilename[filenameWithLowercaseExt(filename)] = src;
      })
    );

    const result: ImageData[] = [];
    for (const photo of imagesFromJson) {
      if (photo.hidden) continue;
      const src = resolvedSrcByFilename[filenameWithLowercaseExt(photo.file_name)];
      if (!src) continue;
      const location = photo.Location || '';
      const year = photo.Year || '';
      const alt = `${photo.image_name}${location ? '. ' + location : ''}${year ? ', ' + year : ''}`.trim() || photo.file_name;
      const width = photo.width;
      const height = photo.height;
      result.push({ src, alt, width, height });
    }
    return result;
  } catch (error) {
    console.error('Error reading image list:', error);
    return [{ src: 'error', alt: (error as Error).toString(), width: 0, height: 0 }];
  }
}

interface ProjectRecord {
  id: string;
  last_modified: string;
  name: string;
  date: string;
  tags: string[];
  description: string;
  urls: Array<{ display_name: string; url: string }>;
}

export const fetchProjects = async (): Promise<Project[]> => {
  const data = await import('$assets/media_manager/projects/data.json');
  const records: ProjectRecord[] = data.default?.records ?? [];

  const allProjects: Project[] = records.map((record) => ({
    title: record.name,
    date: record.date,
    tags: record.tags as Project['tags'],
    links: record.urls.map((u) => ({ text: u.display_name, url: u.url })),
    image: '',
    description: record.description
  }));

  return allProjects.sort((a: Project, b: Project) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};


export const fetchQuotes = async (): Promise<Quote[]> => {
  const data = await import('$assets/media_manager/quotes/data.json');
  const records = data.default?.records ?? [];

  return records.map((record: any) => ({
    quote: record.quote,
    author: record.author,
    source: record.source,
    show_on_homepage: record.show_on_homepage,
    english_translation: record.english_translation
  }));
};
