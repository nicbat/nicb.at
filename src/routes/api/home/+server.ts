import { fetchHome } from '$lib';
import { json } from '@sveltejs/kit';

// Null (not a 404) when the `home` collection is empty — the home page just drops the intro block.
export const GET = async () => {
	return json(await fetchHome());
};
