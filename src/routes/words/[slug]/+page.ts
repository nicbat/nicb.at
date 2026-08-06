import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/posts/${params.slug}`);
	if (!res.ok) throw error(404, `No post found for "${params.slug}"`);

	const post = await res.json();

	return {
		title: post.meta.title,
		date: post.meta.date,
		html: post.html
	};
};
