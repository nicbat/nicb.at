import { fetchProjects } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const allProjects = await fetchProjects();
	return json(url.searchParams.get('featured') === 'true'
		? allProjects.filter((project) => project.featured)
		: allProjects);
};
