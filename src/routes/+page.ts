import type { PageLoad } from './$types';
import type { Post } from '$lib';
import type { ImageData } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  const [photoRes, introRes] = await Promise.all([
    fetch('/api/home-photo'),
    fetch('/api/home')
  ]);

  const homePhoto: ImageData | null = await photoRes.json();
  const intro: Post | null = await introRes.json();

  return {
    homePhoto,
    introHtml: intro?.html ?? ''
  };
};
