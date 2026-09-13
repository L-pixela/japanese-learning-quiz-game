import { error, redirect } from '@sveltejs/kit'
export async function pageApi<T>(fetcher: typeof fetch, path: string): Promise<T> {
	const response = await fetcher(path)
	if (response.status === 401) redirect(303, '/login')
	if (!response.ok) error(response.status, 'Unable to load your study data. Please try again.')
	return response.json()
}
