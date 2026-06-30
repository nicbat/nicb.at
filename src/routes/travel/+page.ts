import type { PageLoad } from './$types';
import type { TripSummary } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/trips');
	const trips: TripSummary[] = await response.json();

	return {
		trips
	};
};
