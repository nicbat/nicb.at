import type { PageLoad } from './$types';
import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

const posts = import.meta.glob('$assets/blog/*.md');

interface PostModule {
	metadata: { title: string; date: string };
	default: Component;
}

export const load: PageLoad = async ({ params }) => {
	const path = Object.keys(posts).find((p) => p.endsWith(`/${params.slug}.md`));
	if (!path) {
		throw error(404, `No post found for "${params.slug}"`);
	}

	const post = (await posts[path]()) as PostModule;

	return {
		title: post.metadata.title,
		date: post.metadata.date,
		Content: post.default
	};
};
