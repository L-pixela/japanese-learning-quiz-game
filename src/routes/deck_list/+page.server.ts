import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

/**
 * The deck used to be its own section; it now lives on the level page beside
 * the quiz it prepares you for. Old links and bookmarks land there instead.
 */
export const load: PageServerLoad = ({ url }) => {
	const requested = Number(url.searchParams.get('level'))
	const level = Number.isInteger(requested) && requested >= 1 && requested <= 10 ? requested : 1
	redirect(308, `/quiz/${level}`)
}
