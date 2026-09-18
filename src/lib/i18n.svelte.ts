import { dictionary, type Key } from './i18n/dictionary'

export type { Key } from './i18n/dictionary'
export type Lang = 'en' | 'ja'

export const LANGUAGES: Array<{ code: Lang; label: string; flag: string }> = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ja', label: '日本語', flag: '🇯🇵' },
]

const STORAGE_KEY = 'tantore-lang'

function readStored(): Lang {
	if (typeof localStorage === 'undefined') return 'en'
	const stored = localStorage.getItem(STORAGE_KEY)
	return stored === 'ja' || stored === 'en' ? stored : 'en'
}

class I18n {
	current = $state<Lang>('en')

	/** Restore the preference and set the screen reader's document language. */
	hydrate() {
		this.current = readStored()
		this.#apply()
	}

	set(lang: Lang) {
		this.current = lang
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang)
		this.#apply()
	}

	#apply() {
		if (typeof document !== 'undefined') document.documentElement.lang = this.current
	}

	/** Look up a key, substituting {placeholders} from `values`. */
	t(key: Key, values?: Record<string, string | number>): string {
		const entry = dictionary[key]
		// Dynamic keys should show the key rather than crash when missing.
		if (!entry) return key
		const text = (this.current === 'ja' ? entry[1] : entry[0]) || entry[0]
		if (!values) return text
		return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
			name in values ? String(values[name]) : whole,
		)
	}
}

export const i18n = new I18n()

/** Level copy is data keyed by number, so these build the key for you. */
export function levelName(level: number): string {
	return i18n.t(`levelName.${level}` as Key)
}
export function levelDesc(level: number): string {
	return i18n.t(`levelDesc.${level}` as Key)
}
export function difficultyLabel(difficulty: string): string {
	return i18n.t(`difficulty.${difficulty}` as Key)
}

/** Shorthand so markup reads `{t('nav.quiz')}`. */
export function t(key: Key, values?: Record<string, string | number>): string {
	return i18n.t(key, values)
}
