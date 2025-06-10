import { fetchProjects } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const allProjects = await fetchProjects();
	return json(allProjects);
}; 