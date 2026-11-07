import type { PageLoad } from './$types';
import type { Post } from '$lib';
import type { ImageData, Project } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  const [photoRes, introRes, favoritesRes, projectsRes] = await Promise.all([
    fetch('/api/home-photo'),
    fetch('/api/home'),
    fetch('/api/favorites'),
    fetch('/api/projects?featured=true')
  ]);

  const homePhoto: ImageData | null = await photoRes.json();
  const intro: Post | null = await introRes.json();
  const favorites: ImageData[] = await favoritesRes.json();
  const projects: Project[] = await projectsRes.json();

  return {
    homePhoto,
    favorites,
    projects,
    introHtml: intro?.html ?? ''
  };
};
