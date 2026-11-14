import { fetchTrips } from '$lib';
import { error, json } from '@sveltejs/kit';
import { TRAVEL_ENABLED } from '$lib/features';

export const GET = async () => {
	if (!TRAVEL_ENABLED) error(404, 'Not found');
	const trips = await fetchTrips();

	return json(trips);
};
