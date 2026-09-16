/**
 * The three directions a vocabulary question can run.
 *
 * Asking only `meaning` trains recognition, which is the easiest thing to fake:
 * you can pick the right English from four options while being unable to
 * produce or read the word. `word` asks for recall and `reading` asks for the
 * kana, so one quiz covers all three.
 */
export const QUESTION_TYPES = ['meaning', 'word', 'reading'] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

/** What the learner is shown, and what they are picking, for each direction. */
export type Question = {
	type: QuestionType
	/** The word itself — withheld on `word` questions, which ask for it. */
	japanese: string | null
	/** The kana — shown only on `meaning` questions; it is the answer elsewhere. */
	reading: string | null
	/** The English — shown only on `word` questions, which ask you to recall it. */
	meaning: string | null
	options: string[]
}
