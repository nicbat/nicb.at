// TODO wrap in try catch
// TODO make it typescripty

/** @type {import('@sveltejs/kit').Load} */
export async function load({ params }) {
	const post = await import(`$assets/blog/${params.slug}.md`); // TODO fix absolute path
	const { title, date } = post.metadata;
	const Content = post.default;

	return {
		title,
		date,
		Content
	};
}
