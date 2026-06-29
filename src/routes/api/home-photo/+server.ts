import { fetchHomePhoto } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const homePhoto = await fetchHomePhoto();
	return json(homePhoto);
};
