import { fetchQuotes } from '$lib';
import { json } from '@sveltejs/kit';

export const GET = async () => {
    const allQuotes = await fetchQuotes();
    const homepageQuotes = allQuotes.filter(quote => quote.show_on_homepage);
    return json(homepageQuotes);
};
