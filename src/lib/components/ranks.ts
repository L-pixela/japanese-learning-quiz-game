import misoSoupImage from '$lib/assets/ranks/miso_soup.png'
import riceBowlImage from '$lib/assets/ranks/rice_bowl.png'
import takoyakiImage from '$lib/assets/ranks/takoyaki.png'
import tamagoyakiImage from '$lib/assets/ranks/tamagoyaki.png'
import tonkatsuImage from '$lib/assets/ranks/tonkatsu.png'
import udonTsukimiImage from '$lib/assets/ranks/udon_tsukimi.png'
import yakinikuImage from '$lib/assets/ranks/yakiniku.png'

export type RankTier = {
	id: string
	name: string
	nameJp: string
	minStreak: number
	maxStreak: number | null
	image: string
	ringColor: string
}

export const RANKS: RankTier[] = [
	{
		id: 'rice_bowl',
		name: 'Rice Bowl',
		nameJp: 'ご飯',
		minStreak: 0,
		maxStreak: 2,
		image: riceBowlImage,
		ringColor: '#B7AC86',
	},
	{
		id: 'miso_soup',
		name: 'Miso Soup',
		nameJp: '味噌汁',
		minStreak: 3,
		maxStreak: 6,
		image: misoSoupImage,
		ringColor: '#C64B6B',
	},
	{
		id: 'tamagoyaki',
		name: 'Tamagoyaki',
		nameJp: '卵焼き',
		minStreak: 7,
		maxStreak: 13,
		image: tamagoyakiImage,
		ringColor: '#E8735A',
	},
	{
		id: 'tsukimi_udon',
		name: 'Tsukimi Udon',
		nameJp: '月見うどん',
		minStreak: 14,
		maxStreak: 29,
		image: udonTsukimiImage,
		ringColor: '#6E8F63',
	},
	{
		id: 'takoyaki',
		name: 'Takoyaki',
		nameJp: 'たこ焼き',
		minStreak: 30,
		maxStreak: 59,
		image: takoyakiImage,
		ringColor: '#4C7FB0',
	},
	{
		id: 'tonkatsu',
		name: 'Tonkatsu',
		nameJp: 'とんかつ',
		minStreak: 60,
		maxStreak: 99,
		image: tonkatsuImage,
		ringColor: '#C43D3D',
	},
	{
		id: 'yakiniku',
		name: 'Yakiniku',
		nameJp: '焼肉',
		minStreak: 100,
		maxStreak: null,
		image: yakinikuImage,
		ringColor: '#E8804B',
	},
]

export function getRankFromStreak(streak: number): RankTier {
	if (streak < 0) return RANKS[0]
	for (let i = RANKS.length - 1; i >= 0; i--) {
		if (streak >= RANKS[i].minStreak) return RANKS[i]
	}
	return RANKS[0]
}

export function getNextRank(current: RankTier): RankTier | null {
	const idx = RANKS.findIndex((r) => r.id === current.id)
	if (idx === -1 || idx === RANKS.length - 1) return null
	return RANKS[idx + 1]
}

export function getRankProgress(streak: number): {
	fraction: number
	daysToNext: number
	next: RankTier
} | null {
	const current = getRankFromStreak(streak)
	const next = getNextRank(current)
	if (!next) return null

	const span = next.minStreak - current.minStreak
	const into = streak - current.minStreak
	return {
		fraction: Math.min(1, Math.max(0, into / span)),
		daysToNext: Math.max(0, next.minStreak - streak),
		next,
	}
}
