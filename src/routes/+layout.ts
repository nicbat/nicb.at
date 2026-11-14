//export const prerender = true; // for github pages prerendering (static site)
//export const trailingSlash = "always";
import type { SiteTreeData } from '$lib/terminal/shell';

// The site terminal (in +layout.svelte) needs the list of posts on every page. The URL
// never changes, so SvelteKit loads it once and keeps it across navigations.
export const load = async ({ fetch }) => {
  const res = await fetch('/api/tree');
  const tree: SiteTreeData = res.ok ? await res.json() : { words: [] };
  return { tree };
};
