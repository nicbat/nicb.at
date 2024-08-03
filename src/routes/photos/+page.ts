import type { PageLoad } from './$types';
import type { ImageData } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/api/images');
  const images: ImageData[] = await response.json();

  console.log(images);

  return {
    images
  };
};
