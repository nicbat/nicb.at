// place files you want to import through the `$lib` alias in this folder.
import { readdirSync } from 'fs';
import { join } from 'path';
import type { ImageData } from '$lib/types';

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('$assets/blog/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const { metadata } = await resolver();
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
    const allImageFiles = import.meta.glob('$assets/photos/*.{jpg,jpeg,png,gif}');
    const iterableImageFiles = Object.entries(allImageFiles);

    const allImages = await Promise.all(
      iterableImageFiles.map(async ([path, resolver]) => {
        const { default: src } = await resolver();
        //return metadata;
        return {
          src: `${src}`,
          alt: src.split('.')[0], // Use filename as alt text
        };
      })
    );
    return allImages;
  } catch (error) {
    console.error('Error reading image directory:', error);
    return [error.toString()];
  }
}

