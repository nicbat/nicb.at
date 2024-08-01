// place files you want to import through the `$lib` alias in this folder.

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('/src/routes/blog/posts/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const { metadata } = await resolver();
			const postPath = '/blog' + path.slice(22, -3);

			return {
				meta: metadata,
				path: postPath
			};
		})
	);

	return allPosts;
};
