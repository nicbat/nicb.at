import { fetchNow } from '$lib';
import { error, json } from '@sveltejs/kit';

export const GET = async () => {
	const now = await fetchNow();
	if (!now) throw error(404, 'No now post found');
	return json(now);
};
