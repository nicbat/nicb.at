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

export const fetchImageList = async () => {
  try {
    // Read the photos.json file to get image metadata
    let photoMetadata: Record<string, string> = {};
    try {
      const photosJson = await import('$assets/photos.json');
      photoMetadata = photosJson.default.images.reduce((acc: Record<string, string>, photo: { file_name: string; image_name: string; Location: string; Year: string; hidden: boolean }) => {
        // skip hidden photos
        // TODO this is super hacky, make skipping images a native feature of the site
        if (photo.hidden) {
          acc[photo.file_name] = "-SKIP-";
          return acc;
        }
        // Create alt text in format: "image_name, Location Year"
        const location = photo.Location || '';
        const year = photo.Year || '';
        const altText = `${photo.image_name}${location ? '. ' + location : ''}${year ? ', ' + year : ''}`;
        acc[photo.file_name] = altText;
        return acc;
      }, {});
    } catch (error) {
      console.warn('Could not load photos.json, using filenames as alt text');
    }

    const allImageFiles = import.meta.glob('$assets/photos/*.{jpg,jpeg,png,gif}');
    const iterableImageFiles = Object.entries(allImageFiles);

    const allImages = await Promise.all(
      iterableImageFiles.map(async ([path, resolver]) => {
        const { default: src } = await (resolver as () => Promise<{ default: string }>)();
        const filename = path.split('/').pop() || '';
        
        // Use metadata from JSON if available, otherwise use filename
        const alt = photoMetadata[filename] || filename.split('.')[0];
        
        return {
          src: `${src}`,
          alt: alt,
        };
      })
    );
    const filteredImages = allImages.filter((val) => {
      return (val.alt !== "-SKIP-")
    })
    return filteredImages;
  } catch (error) {
    console.error('Error reading image directory:', error);
    return [{ src: 'error', alt: (error as Error).toString() }];
  }
}

export const fetchProjects = async () => {
  const allProjectFiles = import.meta.glob<Project>('$assets/projects/*.json');
  const iterableProjectFiles = Object.entries(allProjectFiles);

  const allProjects = await Promise.all(
    iterableProjectFiles.map(async ([path, resolver]) => {
      const project = await (resolver as () => Promise<Project>)();
      return {
        ...project,
        path: path.slice(16, -5) // Remove '$assets/projects/' and '.json'
      };
    })
  );

  return allProjects.sort((a: Project, b: Project) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

