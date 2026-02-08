// place files you want to import through the `$lib` alias in this folder.
import type { ImageData } from '$lib/types';
import type { Project } from './types';

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('$assets/blog/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const { metadata } = await (resolver as () => Promise<{ metadata: any }>)();
			const postPath = '/blog' + path.slice(16, -3);

			return {
				meta: metadata,
				path: postPath
			};
		})
	);

	return allPosts;
};

export const fetchImageList = async (): Promise<ImageData[]> => {
  try {
    const imageData = await import('$assets/media_manager/photos/image-data.json');
    const imagesFromJson = (imageData.default?.images ?? []) as Array<{
      file_name: string;
      image_name: string;
      Location: string;
      Year: string;
      hidden: boolean;
    }>;

    const allImageFiles = import.meta.glob('$assets/media_manager/photos/files/*.{jpg,jpeg,png,gif}');
    const resolvedSrcByFilename: Record<string, string> = {};
    await Promise.all(
      Object.entries(allImageFiles).map(async ([path, resolver]) => {
        const { default: src } = await (resolver as () => Promise<{ default: string }>)();
        const filename = path.split('/').pop() || '';
        resolvedSrcByFilename[filename] = src;
      })
    );

    const result: ImageData[] = [];
    for (const photo of imagesFromJson) {
      if (photo.hidden) continue;
      const src = resolvedSrcByFilename[photo.file_name];
      if (!src) continue;
      const location = photo.Location || '';
      const year = photo.Year || '';
      const alt = `${photo.image_name}${location ? '. ' + location : ''}${year ? ', ' + year : ''}`.trim() || photo.file_name;
      result.push({ src, alt });
    }
    return result;
  } catch (error) {
    console.error('Error reading image list:', error);
    return [{ src: 'error', alt: (error as Error).toString() }];
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

