import type { PageLoad } from './$types';
import type { Trip } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/trips/${params.slug}`);
	if (!response.ok) {
		throw error(response.status, `No trip found for "${params.slug}"`);
	}

	const trip: Trip = await response.json();

	return {
		trip
	};
};
