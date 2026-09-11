import { json } from '@sveltejs/kit'

type ParsedCardFields = { ok: false; error: Response } | { ok: true; front: string; back: string }

export async function parseCardFields(
	request: Request,
	userId: string | undefined,
): Promise<ParsedCardFields> {
	if (!userId) {
		return { ok: false, error: json({ error: 'unauthorized' }, { status: 401 }) }
	}

	const { front, back } = (await request.json()) as { front?: string; back?: string }

	if (!front || typeof front !== 'string' || front.trim().length === 0) {
		return { ok: false, error: json({ error: 'front is required' }, { status: 400 }) }
	}

	if (!back || typeof back !== 'string' || back.trim().length === 0) {
		return { ok: false, error: json({ error: 'back is required' }, { status: 400 }) }
	}

	return { ok: true, front, back }
}
