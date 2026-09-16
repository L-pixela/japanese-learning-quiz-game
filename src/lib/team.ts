// Katakana (japanese) is the primary display name; romaji (name) is the secondary line.
// Drop artwork into static/team/ and point image at '/team/your-file.webp'.
// Keep image null to show the intentional portrait placeholder.
export const team: Array<{
	role: string
	name: string
	japanese: string
	contribution: string
	/* Short, scannable bullets — one deliverable each, not prose. */
	summary: string[]
	image: string | null
}> = [
	{
		role: 'Team Leader',
		name: 'Thay Bunleap',
		japanese: 'タイ・ブンリープ',
		contribution: 'Backend & infrastructure design',
		summary: [
			'Backend architecture & database schema',
			'Register API',
			'Deck management API',
			'Quiz scoring: points, streak, rank',
			'User profile endpoint',
			'Led the pivot to level-based quizzes',
		],
		image: '/team/bunleap.webp',
	},
	{
		role: 'Sub Leader',
		name: 'Sin Phourivath',
		japanese: 'シン・プリワット',
		contribution: 'Backend development',
		summary: [
			'Project setup & deployment pipeline',
			'Deck creation API',
			'Level-based quiz question API',
			'SonarCloud + Renovate for code quality',
		],
		image: '/team/phourivath.webp',
	},
	{
		role: 'Member',
		name: 'Saphorn Thida',
		japanese: 'サポーン・ティダ',
		contribution: 'Frontend development',
		summary: [
			'Spell-checking tooling',
			'Rank badge components',
			'Register & login page UI',
			'Dashboard connected to real data',
		],
		image: '/team/thida.webp',
	},
	{
		role: 'Member',
		name: 'Ouk Sreysor',
		japanese: 'オク・スレイソー',
		contribution: 'Frontend development',
		summary: ['Code formatting & linting standards', 'Deck list UI', 'Quiz results screen'],
		image: '/team/sreysor.webp',
	},
	{
		role: 'Member',
		name: 'Phon Sovatanak',
		japanese: 'ポン・ソヴァタナク',
		contribution: 'Backend development',
		summary: [
			'Cloudflare D1 + Drizzle ORM setup',
			'Card management API',
			'Login & session system',
			'Vocabulary word database',
			'Leaderboard API',
		],
		image: '/team/sovathanak.webp',
	},
	{
		role: 'Member',
		name: 'Tang Sonika',
		japanese: 'タン・ソニカ',
		contribution: 'Frontend development',
		summary: ['UI animations', 'Responsive layout', 'Quiz-taking screen'],
		image: '/team/sonika.webp',
	},
]
