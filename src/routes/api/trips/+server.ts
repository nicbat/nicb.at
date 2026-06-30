import { fetchTrips } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const trips = await fetchTrips();

	return json(trips);
};
