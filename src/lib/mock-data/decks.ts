// TEMPORARY: mock deck data for UI development.
// cardCount is UI-only — not yet returned by GET /api/decks.
// Replace with real API call once available.

export type MockDeck = {
	id: string
	userId: string
	title: string
	cardCount: number
	createdAt: Date
}

export const MOCK_DECKS: MockDeck[] = [
	{
		id: '1',
		userId: 'mock-user',
		title: 'JLPT N4 Verbs',
		cardCount: 42,
		createdAt: new Date('2026-08-01'),
	},
	{
		id: '2',
		userId: 'mock-user',
		title: 'Business Japanese',
		cardCount: 18,
		createdAt: new Date('2026-08-15'),
	},
	{
		id: '3',
		userId: 'mock-user',
		title: 'Kanji: Numbers & Time',
		cardCount: 30,
		createdAt: new Date('2026-09-01'),
	},
	{
		id: '4',
		userId: 'mock-user',
		title: 'Greetings & Small Talk',
		cardCount: 12,
		createdAt: new Date('2026-09-05'),
	},
]
