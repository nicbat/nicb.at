import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Heading } from '$lib/types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/posts/${params.slug}`);
	if (!res.ok) throw error(404, `No post found for "${params.slug}"`);

	const post = await res.json();

	return {
		title: post.meta.title,
		date: post.meta.date as string | undefined,
		// Optional frontmatter: when a post is revised (add `updated` to the Words schema in the media
		// manager to use it). Shown beside the date when set.
		updated: post.meta.updated as string | undefined,
		html: post.html,
		headings: (post.headings ?? []) as Heading[]
	};
};
