import { fetchPost } from '$lib';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ params }) => {
	const post = await fetchPost(params.slug);
	if (!post) throw error(404, `No post found for "${params.slug}"`);
	return json(post);
};
