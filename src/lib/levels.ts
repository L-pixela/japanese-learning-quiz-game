export const LEVELS = [
	['はじめ', 'First steps', 'Everyday N4 words'],
	['暮らし', 'Daily life', 'Home, routines & people'],
	['街', 'Around town', 'Getting out & about'],
	['広がり', 'New horizons', 'Building your N4 foundation'],
	['橋', 'The bridge', 'Upper N4 vocabulary'],
	['発見', 'Discovery', 'Your first N3 words'],
	['つながり', 'Connections', 'Ideas & relationships'],
	['深まり', 'Going deeper', 'More nuanced N3 vocabulary'],
	['挑戦', 'The challenge', 'Abstract ideas & expression'],
	['頂上', 'The summit', 'Put your N3 knowledge to work'],
].map(([japanese, name, description], index) => ({
	level: index + 1,
	japanese,
	name,
	description,
	difficulty: index < 3 ? 'Easy' : index < 7 ? 'Medium' : 'Hard',
}))
export type LevelProgress = (typeof LEVELS)[number] & {
	status: 'not_started' | 'attempted' | 'completed'
	bestScore: number
	attempts: number
	updatedAt: string | null
}
export const STATUS_LABELS = {
	not_started: 'Not started',
	attempted: 'Keep practicing',
	completed: 'Completed',
}
