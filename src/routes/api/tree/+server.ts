import { fetchSiteTree } from '$lib';
import { json } from '@sveltejs/kit';

// Posts and trips for the site terminal's `cd` / `ls` / `tree` and tab completion.
export const GET = async () => json(await fetchSiteTree());
