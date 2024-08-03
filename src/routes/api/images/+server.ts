import { fetchImageList } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const allImages = await fetchImageList();

	return json(allImages);
};
