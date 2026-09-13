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
	minPoints: number
	maxPoints: number | null
	image: string
	ringColor: string
}

export const RANKS: RankTier[] = [
	{
		id: 'shiragohan',
		name: 'Shiragohan',
		nameJp: '白ご飯',
		minPoints: 0,
		maxPoints: 9,
		image: riceBowlImage,
		ringColor: '#B7AC86',
	},
	{
		id: 'umeboshi',
		name: 'Umeboshi',
		nameJp: '梅干し',
		minPoints: 10,
		maxPoints: 19,
		image: misoSoupImage,
		ringColor: '#C64B6B',
	},
	{
		id: 'mentaiko',
		name: 'Mentaiko',
		nameJp: '明太子',
		minPoints: 20,
		maxPoints: 29,
		image: tamagoyakiImage,
		ringColor: '#E8735A',
	},
	{
		id: 'wasabi',
		name: 'Wasabi',
		nameJp: 'わさび',
		minPoints: 30,
		maxPoints: 39,
		image: udonTsukimiImage,
		ringColor: '#6E8F63',
	},
	{
		id: 'ichimi-togarashi',
		name: 'Ichimi Togarashi',
		nameJp: '一味唐辛子',
		minPoints: 40,
		maxPoints: 59,
		image: takoyakiImage,
		ringColor: '#4C7FB0',
	},
	{
		id: 'gekikara-kimchi',
		name: 'Gekikara Kimchi',
		nameJp: '激辛キムチ',
		minPoints: 60,
		maxPoints: 79,
		image: tonkatsuImage,
		ringColor: '#C43D3D',
	},
	{
		id: 'hinotama',
		name: 'Hinotama',
		nameJp: '火の玉',
		minPoints: 80,
		maxPoints: null,
		image: yakinikuImage,
		ringColor: '#E8804B',
	},
]

export function getRankFromPoints(points: number): RankTier {
	if (points < 0) return RANKS[0]
	for (let i = RANKS.length - 1; i >= 0; i--) {
		if (points >= RANKS[i].minPoints) return RANKS[i]
	}
	return RANKS[0]
}

export function getNextRank(current: RankTier): RankTier | null {
	const idx = RANKS.findIndex((r) => r.id === current.id)
	if (idx === -1 || idx === RANKS.length - 1) return null
	return RANKS[idx + 1]
}

export function getRankProgress(points: number): {
	fraction: number
	pointsToNext: number
	next: RankTier
} | null {
	const current = getRankFromPoints(points)
	const next = getNextRank(current)
	if (!next) return null

	const span = next.minPoints - current.minPoints
	const into = points - current.minPoints
	return {
		fraction: Math.min(1, Math.max(0, into / span)),
		pointsToNext: Math.max(0, next.minPoints - points),
		next,
	}
}
