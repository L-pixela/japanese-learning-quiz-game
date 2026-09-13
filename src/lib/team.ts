// Replace image with '/team/your-file.webp' after adding artwork to static/team/.
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
		japanese: 'ブンリープ',
		contribution: 'Backend & infrastructure design',
		image: null,
	},
	{
		role: 'Sub Leader',
		name: 'Sin Phourivath',
		japanese: 'プリワート',
		contribution: 'Backend development',
		image: null,
	},
	{
		role: 'Member',
		name: 'Saphorn Thida',
		japanese: 'サポーン・ティダ',
		contribution: 'Frontend development',
		image: null,
	},
	{
		role: 'Member',
		name: 'Ouk Sreysor',
		japanese: 'オク．スレソ',
		contribution: 'Frontend development',
		image: null,
	},
	{
		role: 'Member',
		name: 'Phon Sovatanak',
		japanese: 'ポンソヴァタナク',
		contribution: 'Backend development',
		image: null,
	},
	{
		role: 'Member',
		name: 'Tang Sonika',
		japanese: 'ソニカ',
		contribution: 'Frontend development',
		image: null,
	},
]
