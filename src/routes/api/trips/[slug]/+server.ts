import { fetchTrip } from '$lib';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ params }) => {
	const trip = await fetchTrip(params.slug);
	if (!trip) {
		throw error(404, `No trip found for "${params.slug}"`);
	}

	return json(trip);
};
