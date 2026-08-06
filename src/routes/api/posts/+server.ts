import { fetchMarkdownPosts } from '$lib';
import { json } from '@sveltejs/kit';

// The reader already returns the `words` collection newest-first, so no sort is needed here.
export const GET = async () => {
	return json(await fetchMarkdownPosts());
};
