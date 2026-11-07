import { fetchFavoriteImages } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async () => json(await fetchFavoriteImages());
