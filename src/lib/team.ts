// Katakana (japanese) is the primary display name; romaji (name) is the secondary line.
// Drop artwork into static/team/ and point image at '/team/your-file.webp'.
// Keep image null to show the intentional portrait placeholder.
export const team: Array<{
	role: string
	roleJa: string
	name: string
	japanese: string
	contribution: string
	contributionJa: string
	/* Short, scannable bullets — one deliverable each, not prose. */
	summary: string[]
	image: string | null
}> = [
	{
		role: 'Team Leader',
		roleJa: 'チームリーダー',
		name: 'Thay Bunleap',
		japanese: 'タイ・ブンリープ',
		contribution: 'Backend & infrastructure design',
		contributionJa: 'バックエンド・基盤設計',
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
		roleJa: 'サブリーダー',
		name: 'Sin Phourivath',
		japanese: 'シン・プリワット',
		contribution: 'Backend development',
		contributionJa: 'バックエンド開発',
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
		roleJa: 'メンバー',
		name: 'Saphorn Thida',
		japanese: 'サポーン・ティダ',
		contribution: 'Frontend development',
		contributionJa: 'フロントエンド開発',
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
		roleJa: 'メンバー',
		name: 'Ouk Sreysor',
		japanese: 'オク・スレイソー',
		contribution: 'Frontend development',
		contributionJa: 'フロントエンド開発',
		summary: ['Code formatting & linting standards', 'Deck list UI', 'Quiz results screen'],
		image: '/team/sreysor.webp',
	},
	{
		role: 'Member',
		roleJa: 'メンバー',
		name: 'Phon Sovatanak',
		japanese: 'ポン・ソヴァタナク',
		contribution: 'Backend development',
		contributionJa: 'バックエンド開発',
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
		roleJa: 'メンバー',
		name: 'Tang Sonika',
		japanese: 'タン・ソニカ',
		contribution: 'Frontend development',
		contributionJa: 'フロントエンド開発',
		summary: ['UI animations', 'Responsive layout', 'Quiz-taking screen'],
		image: '/team/sonika.webp',
	},
]
