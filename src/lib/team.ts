// Katakana (japanese) is the primary display name; romaji (name) is the secondary line.
// Drop artwork into static/team/ and point image at '/team/your-file.webp'.
// Keep image null to show the intentional portrait placeholder.
export const team: Array<{
	role: string
	name: string
	japanese: string
	contribution: string
	image: string | null
}> = [
	{
		role: 'Team Leader',
		name: 'Thay Bunleap',
		japanese: 'タイ・ブンリープ',
		contribution: 'Backend & infrastructure design',
		image: '/team/bunleap.webp',
	},
	{
		role: 'Sub Leader',
		name: 'Sin Phourivath',
		japanese: 'シン・プリワット',
		contribution: 'Backend development',
		image: '/team/phourivath.webp',
	},
	{
		role: 'Member',
		name: 'Saphorn Thida',
		japanese: 'サポーン・ティダ',
		contribution: 'Frontend development',
		image: '/team/thida.webp',
	},
	{
		role: 'Member',
		name: 'Ouk Sreysor',
		japanese: 'オク・スレイソー',
		contribution: 'Frontend development',
		image: '/team/sreysor.webp',
	},
	{
		role: 'Member',
		name: 'Phon Sovatanak',
		japanese: 'ポン・ソヴァタナク',
		contribution: 'Backend development',
		image: '/team/sovathanak.webp',
	},
	{
		role: 'Member',
		name: 'Tang Sonika',
		japanese: 'タン・ソニカ',
		contribution: 'Frontend development',
		image: '/team/sonika.webp',
	},
]
