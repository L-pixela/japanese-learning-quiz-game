// Katakana (japanese) is the primary display name; romaji (name) is the secondary line.
// Drop artwork into static/team/ and point image at '/team/your-file.webp'.
// Keep image null to show the intentional portrait placeholder.
export const team: Array<{
	role: string
	name: string
	japanese: string
	contribution: string
	summary: string
	image: string | null
}> = [
	{
		role: 'Team Leader',
		name: 'Thay Bunleap',
		japanese: 'タイ・ブンリープ',
		contribution: 'Backend & infrastructure design',
		summary:
			"Designed the backend architecture and database schema. Built the register API, deck management API, quiz scoring logic (points/streak/rank), and the user profile endpoint. Led the team's pivot to a level-based quiz system.",
		image: '/team/bunleap.webp',
	},
	{
		role: 'Sub Leader',
		name: 'Sin Phourivath',
		japanese: 'シン・プリワット',
		contribution: 'Backend development',
		summary:
			'Set up the initial project and deployment pipeline. Built the deck creation API, the level-based quiz question API, and configured SonarCloud + Renovate for code quality.',
		image: '/team/phourivath.webp',
	},
	{
		role: 'Member',
		name: 'Saphorn Thida',
		japanese: 'サポーン・ティダ',
		contribution: 'Frontend development',
		summary:
			'Set up spell-checking tooling. Built the rank badge components, the register and login page UI, and connected the dashboard to real data.',
		image: '/team/thida.webp',
	},
	{
		role: 'Member',
		name: 'Ouk Sreysor',
		japanese: 'オク・スレイソー',
		contribution: 'Frontend development',
		summary:
			'Set up code formatting and linting standards. Built the deck list UI and the quiz results screen.',
		image: '/team/sreysor.webp',
	},
	{
		role: 'Member',
		name: 'Phon Sovatanak',
		japanese: 'ポン・ソヴァタナク',
		contribution: 'Backend development',
		summary:
			'Set up the Cloudflare D1 database and Drizzle ORM. Built the card management API, login/session system, the vocabulary word database, and the leaderboard API.',
		image: '/team/sovathanak.webp',
	},
	{
		role: 'Member',
		name: 'Tang Sonika',
		japanese: 'タン・ソニカ',
		contribution: 'Frontend development',
		summary: 'Built the UI animations, responsive layout, and the quiz-taking screen.',
		image: '/team/sonika.webp',
	},
]
