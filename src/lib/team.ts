// Katakana (japanese) is the primary display name; romaji (name) is the secondary line.
// Drop artwork into static/team/ and point image at '/team/your-file.webp'.
// Keep image null to show the intentional portrait placeholder.
export const team: Array<{
	role: string
	name: string
	japanese: string
	contribution: string
	highlights: string[]
	image: string | null
}> = [
	{
		role: 'Team Leader',
		name: 'Thay Bunleap',
		japanese: 'タイ・ブンリープ',
		contribution: 'Backend & infrastructure design',
		highlights: [
			'Designed the backend architecture',
			'Design database schema',
			'Built the register API, deck management, quiz scoring, and user profile endpoints',
			"Led the team's",
		],
		image: '/team/bunleap.webp',
	},
	{
		role: 'Sub Leader',
		name: 'Sin Phourivath',
		japanese: 'シン・プリワット',
		contribution: 'Backend development',
		highlights: [
			'Set up the initial project and deployment pipeline',
			'Built the deck creation and level-based quiz question APIs',
			'Configured SonarCloud and Renovate',
		],
		image: '/team/phourivath.webp',
	},
	{
		role: 'Member',
		name: 'Saphorn Thida',
		japanese: 'サポーン・ティダ',
		contribution: 'Frontend development',
		highlights: [
			'Set up spell-checking tooling',
			'Built the rank badge components and login/register UI',
			'Connected the dashboard',
		],
		image: '/team/thida.webp',
	},
	{
		role: 'Member',
		name: 'Ouk Sreysor',
		japanese: 'オク・スレイソー',
		contribution: 'Frontend development',
		highlights: [
			'Set up code formatting and linting standards.',
			'Built the deck list interface.',
			'Designed the quiz results screen.',
		],
		image: '/team/sreysor.webp',
	},
	{
		role: 'Member',
		name: 'Phon Sovatanak',
		japanese: 'ポン・ソヴァタナク',
		contribution: 'Backend development',
		highlights: [
			'Set up the Cloudflare D1 database and Drizzle ORM',
			'Built the card management API and login/session system',
			'Created the vocabulary database and leaderboard API',
		],
		image: '/team/sovathanak.webp',
	},
	{
		role: 'Member',
		name: 'Tang Sonika',
		japanese: 'タン・ソニカ',
		contribution: 'Frontend development',
		highlights: [
			'Built UI animations and motion details',
			'Improved the responsive layout',
			'Created the quiz-taking screen experience',
		],
		image: '/team/sonika.webp',
	},
]
