import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/now');
	const now = await res.json();

	return {
		updated: now.meta.date,
		html: now.html
	};
};
