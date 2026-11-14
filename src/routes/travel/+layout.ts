import { error } from '@sveltejs/kit';
import { TRAVEL_ENABLED } from '$lib/features';

// Travel is hidden (see $lib/features): /travel and every trip page under it 404.
export const load = () => {
	if (!TRAVEL_ENABLED) error(404, 'Not found');
};
