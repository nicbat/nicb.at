import type { PageLoad } from './$types';
import type { ImageData } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/api/home-photo');
  const homePhoto: ImageData | null = await response.json();

  return {
    homePhoto
  };
};
