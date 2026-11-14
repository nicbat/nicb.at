import { fetchTrip } from '$lib';
import { error, json } from '@sveltejs/kit';
import { TRAVEL_ENABLED } from '$lib/features';

export const GET = async ({ params }) => {
	if (!TRAVEL_ENABLED) error(404, 'Not found');
	const trip = await fetchTrip(params.slug);
	if (!trip) {
		throw error(404, `No trip found for "${params.slug}"`);
	}

	return json(trip);
};
