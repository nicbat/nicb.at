import type { PageLoad } from './$types';
import type { Component } from 'svelte';

const docs = import.meta.glob('$assets/now.md');

interface NowModule {
	metadata: { updated: string };
	default: Component;
}

export const load: PageLoad = async () => {
	const path = Object.keys(docs)[0];
	const doc = (await docs[path]()) as NowModule;

	return {
		updated: doc.metadata.updated,
		Content: doc.default
	};
};
