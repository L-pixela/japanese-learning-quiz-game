/**
 * Two languages, one dictionary.
 *
 * `t('nav.quiz')` returns the string for the active language. Keys are grouped
 * by screen so a page's copy stays together. A missing Japanese string falls
 * back to English rather than rendering the raw key.
 *
 * The choice lives in localStorage and on <html lang>, so a reload keeps it and
 * screen readers announce the right language.
 */
export type Lang = 'en' | 'ja'

export const LANGUAGES: Array<{ code: Lang; label: string; flag: string }> = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ja', label: '日本語', flag: '🇯🇵' },
]

const STORAGE_KEY = 'tantore-lang'

const dictionary = {
	'nav.overview': ['Overview', 'ホーム'],
	'nav.quiz': ['Quiz', 'クイズ'],
	'nav.decks': ['My deck', '単語帳'],
	'nav.team': ['Our team', 'チーム'],
	'nav.brandTagline': ['Word training', '単語トレーニング'],
	'nav.language': ['Language', '言語'],
	'nav.theme': ['Theme', 'テーマ'],
	'nav.menu': ['Menu', 'メニュー'],
	'nav.music': ['Background music', 'BGM'],
	'nav.sfx': ['Sound effects', '効果音'],
	'sound.on': ['on', 'オン'],
	'sound.off': ['off', 'オフ'],
	'theme.light': ['Light', 'ライト'],
	'theme.dark': ['Dark', 'ダーク'],
	'theme.system': ['System', 'システム'],

	'footer.tagline': ['A little practice, every day.', '毎日少しずつ。'],
	'footer.madeBy': ['Made by our team', 'チーム紹介'],

	'dashboard.eyebrow': ['Your study desk', '学びの時間'],
	'dashboard.welcome': ['Welcome back, {name}.', 'おかえりなさい、{name}さん。'],
	'dashboard.lead': ['A few words today.', '今日も少しだけ。'],
	'dashboard.totalPoints': ['Total points', '合計ポイント'],
	'dashboard.totalPointsHint': ['', ''],
	'dashboard.streak': ['Current streak', '連続日数'],
	'dashboard.streakDays': ['days', '日'],
	'dashboard.streakHint': ['', ''],
	'dashboard.rank': ['Current rank', '現在のランク'],
	'dashboard.position': ['Leaderboard position', 'ランキング順位'],
	'dashboard.positionHint': ['', ''],
	'dashboard.heroEyebrow': ['Vocabulary practice', '単語の稽古'],
	'dashboard.heroTitle': ['Small steps.\nLasting knowledge.', '小さな一歩を。\n確かな力に。'],
	'dashboard.heroLead': [
		'Ten words. Pick a level and begin.',
		'10単語。レベルを選んで始めましょう。',
	],
	'dashboard.startQuiz': ['Start Quiz', 'クイズを始める'],
	'dashboard.metaQuestions': ['10 questions', '全10問'],
	'dashboard.metaPass': ['6 correct to pass', '6問正解で合格'],
	'dashboard.metaRange': ['N4 → N3', 'N4 → N3'],
	'dashboard.boardEyebrow': ['Leaderboard', '順位表'],
	'dashboard.boardTitle': ['Top learners', '上位の学習者'],
	'dashboard.yourPosition': ['Your position #{n}', 'あなたの順位 #{n}'],
	'dashboard.unranked': ['Unranked', '順位なし'],
	'dashboard.colLearner': ['Learner', '学習者'],
	'dashboard.colUniversity': ['University', '大学'],
	'dashboard.colPoints': ['Points', 'ポイント'],
	'dashboard.you': ['you', 'あなた'],
	'dashboard.viewProfile': ["View {name}'s profile", '{name}さんのプロフィールを見る'],

	'quiz.eyebrow': ['Quiz', 'クイズ'],
	'quiz.title': ['Choose your quiz.', 'クイズを選ぶ。'],
	'quiz.lead': ['10 levels. Start anywhere.', '全10レベル。どこからでも。'],
	'quiz.levelsCompleted': ['levels completed', 'レベル完了'],
	'quiz.rules': ['10 questions · 6 to pass', '全10問 ・ 6問で合格'],
	'quiz.backToMap': ['Level map', 'レベル一覧'],
	'quiz.question': ['QUESTION', '問題'],
	'quiz.chooseMeaning': ['Choose the meaning', '意味を選んでください'],
	'quiz.whatMeans': ['What does this word mean?', 'この単語の意味は？'],
	'quiz.back': ['Back', '戻る'],
	'quiz.next': ['Next word', '次の単語'],
	'quiz.finish': ['Finish quiz', '採点する'],
	'quiz.saving': ['Saving…', '保存中…'],
	'quiz.answered': ['{done} of 10 answered', '10問中 {done}問 回答済み'],
	'quiz.opening': ['Opening your practice…', '準備しています…'],
	'quiz.ready': ['Ready when you are.', '準備はいいですか。'],
	'quiz.readyLead': ['Ten words. Take your time.', '10単語。ゆっくりどうぞ。'],
	'quiz.tryAgain': ['Try again', 'もう一度'],
	'quiz.note': ['6 correct to pass', '6問正解で合格'],

	'result.passedTitle': ['You passed Level {level}!', 'レベル{level} 合格！'],
	'result.failedTitle': ['Not this time.', '今回は残念。'],
	'result.passedLead': ['Your points are saved.', 'ポイントを獲得しました。'],
	'result.failedLead': ['6 correct to pass. Try again.', '合格は6問正解から。もう一度。'],
	'result.correct': ['Correct', '正解数'],
	'result.pointsEarned': ['Points earned', '獲得ポイント'],
	'result.learnersPassed': ['Learners passed', '合格者'],
	'result.outOf': ['of {total}', '全{total}人中'],
	'result.nextQuiz': ['Next quiz', '次のクイズ'],
	'result.practiceAgain': ['Practice again', 'もう一度練習'],
	'result.continueStudy': ['Continue study', '単語帳で復習'],
	'result.passStamp': ['合格', '合格'],
	'result.failStamp': ['残念', '残念'],

	'deck.eyebrow': ['My deck', '単語帳'],
	'deck.title': ['Study the words first.', 'まずは単語から。'],
	'deck.lead': ['Your quiz picks 10 of these at random.', 'クイズはこの中から10問を出題します。'],
	'deck.chooseLevel': ['Choose a level', 'レベルを選ぶ'],
	'deck.level': ['Level', 'レベル'],
	'deck.wordsInDeck': ['words in this deck', 'この単語帳の単語数'],
	'deck.drawnPerQuiz': ['drawn per quiz', '1回の出題数'],
	'deck.bestScore': ['Best {score}/10', '最高 {score}/10'],
	'deck.notAttempted': ['Not attempted yet', '未挑戦'],
	'deck.search': ['Search this deck…', '単語を検索…'],
	'deck.searchLabel': ['Search this deck', '単語を検索'],
	'deck.quizThisLevel': ['Quiz this level', 'このレベルのクイズ'],
	'deck.empty': ['No words in this level yet.', 'このレベルの単語はまだありません。'],
	'deck.noMatch': ['No word here matches “{term}”.', '「{term}」に一致する単語はありません。'],
	'deck.showing': ['{shown} of {total} words', '{total}語中 {shown}語'],

	'status.not_started': ['Not started', '未開始'],
	'status.attempted': ['Keep practicing', '練習中'],
	'status.completed': ['Completed', '完了'],

	'team.eyebrow': ['CADT 1st Batch, Team 4', 'CADT 第1期, チーム4'],
	'team.title': ['Made together.\nFor the way we learn.', 'みんなで作りました。\n学びのかたちを。'],
	'team.lead': ['The people building TanTore.', 'TanToreを作るメンバーです。'],
	'team.together': ['Learning together. Building together.', '共に学び、共に作る。'],
	'team.thanks': ['Thank you for learning with us.', '一緒に学んでくれてありがとう。'],
	'team.portraitPending': ['Portrait to come', '準備中'],

	'auth.loginTitle': ['Welcome back to practice', 'おかえりなさい'],
	'auth.loginIntro': ['Keep your streak. Grow your rank.', '記録を続けて、ランクを育てよう。'],
	'auth.login': ['Log in', 'ログイン'],
	'auth.register': ['Create account', 'アカウント作成'],
	'auth.username': ['Username', 'ユーザー名'],
	'auth.password': ['Password', 'パスワード'],
	'auth.university': ['University (optional)', '大学（任意）'],
	'auth.loggingIn': ['Logging in…', 'ログイン中…'],
	'auth.creating': ['Creating…', '作成中…'],
	'auth.newProfile': ['New profile', '新しいプロフィール'],
	'auth.confirmPassword': ['Confirm password', 'パスワード確認'],
	'auth.noAccount': ['New to TanTore?', 'はじめてですか？'],
	'auth.createAccount': ['Create an account', 'アカウントを作成'],
	'auth.haveAccount': ['Already have an account?', 'アカウントをお持ちですか？'],
	'auth.signOut': ['Sign out', 'ログアウト'],

	'profile.eyebrow': ['Your profile', 'プロフィール'],
	'profile.title': ['Your profile', 'プロフィール'],
	'profile.publicEyebrow': ['Learner profile', '学習者プロフィール'],
	'profile.publicTitle': ['Learner profile', '学習者プロフィール'],
	'profile.backToLeaderboard': ['Back to leaderboard', '順位表に戻る'],
	'profile.about': ['About this learner', 'この学習者について'],
	'profile.edit': ['Edit profile', 'プロフィールを編集'],
	'profile.save': ['Save changes', '保存する'],
	'profile.saving': ['Saving…', '保存中…'],
	'profile.saved': ['Profile saved.', '保存しました。'],
	'profile.cancel': ['Cancel', 'キャンセル'],
	'profile.displayName': ['Name', '名前'],
	'profile.phone': ['Phone number', '電話番号'],
	'profile.linkedin': ['LinkedIn', 'LinkedIn'],
	'profile.github': ['GitHub', 'GitHub'],
	'profile.bio': ['About you', '自己紹介'],
	'profile.notSet': ['Not set', '未設定'],
	'profile.points': ['Points', 'ポイント'],
	'profile.rank': ['Rank', 'ランク'],
	'profile.ranking': ['Ranking', '順位'],
	'profile.streak': ['Streak', '連続日数'],
	'profile.history': ['Quiz history', 'クイズ履歴'],
	'level.stepStudy': ['Step 1 · Study the words', 'ステップ1・単語を覚える'],
	'level.stepQuiz': ['Step 2 · Take the quiz', 'ステップ2・クイズに挑戦'],
	'level.startQuiz': ['Start the quiz', 'クイズを始める'],
	'level.studyLead': [
		'Read through the {count} words below, then take the quiz when you feel ready. Ten questions are drawn from this list.',
		'下の{count}語に目を通してから、準備ができたらクイズへ。この中から10問出題されます。',
	],
	'level.allLevels': ['All levels', 'レベル一覧'],
	'level.backToStudy': ['Back to the words', '単語に戻る'],
	'level.yourBest': ['Your best', 'ベスト'],
	'result.reviewAnswers': ['Review your answers', '答えを見直す'],
	'profile.climbEyebrow': ['Climbing', '順位を上げる'],
	'profile.viewLeaderboard': ['View leaderboard', '順位表を見る'],
	'profile.toPosition': ['{n} points to reach #{position}', '{position}位まであと{n}ポイント'],
	'profile.toFirst': ['{n} points to reach #1', '1位まであと{n}ポイント'],
	'profile.tiedWith': [
		'Level with #{position} — a quiz win breaks the tie.',
		'{position}位と同点 — クイズに勝てば逆転できます。',
	],
	'profile.atTop': ['You hold #1. Keep the streak alive.', '現在1位です。連続記録を守りましょう。'],
	'profile.unranked': [
		'Take a quiz to join the leaderboard.',
		'クイズを受けて順位表に参加しましょう。',
	],
	'profile.noHistory': ['No quizzes yet.', 'まだクイズがありません。'],
	'profile.historyLevel': ['Level {level}', 'レベル {level}'],
	'profile.passed': ['Passed', '合格'],
	'profile.failed': ['Not passed', '不合格'],
	'profile.attempts': ['{n} attempts', '{n}回'],
	'nav.profile': ['Profile', 'プロフィール'],

	'rank.yourBadge': ['Your badge', 'あなたのバッジ'],
	'rank.next': ['Next badge', '次のバッジ'],
	'rank.pointsToGo': ['{n} more points to go', 'あと{n}ポイント'],
	'rank.earnedAt': ['{n}+ points', '{n}ポイント以上'],
	'rank.top': ['Highest badge reached', '最高ランク達成'],

	'profile.photo': ['Profile photo', 'プロフィール写真'],
	'profile.choosePhoto': ['Upload photo', '写真をアップロード'],
	'profile.removePhoto': ['Remove photo', '写真を削除'],
	'profile.photoHint': [
		'JPG, PNG or WebP. Square works best.',
		'JPG・PNG・WebP。正方形が最適です。',
	],
	'profile.photoTooBig': ['That image is too large.', '画像が大きすぎます。'],
	'profile.photoBadType': ['Choose an image file.', '画像ファイルを選んでください。'],
} as const

export type Key = keyof typeof dictionary

function readStored(): Lang {
	if (typeof localStorage === 'undefined') return 'en'
	const stored = localStorage.getItem(STORAGE_KEY)
	return stored === 'ja' || stored === 'en' ? stored : 'en'
}

class I18n {
	current = $state<Lang>('en')

	/** Called once on mount, after the browser is available. */
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
		const text = (this.current === 'ja' ? entry[1] : entry[0]) || entry[0]
		if (!values) return text
		return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
			name in values ? String(values[name]) : whole,
		)
	}
}

export const i18n = new I18n()

/** Shorthand so markup reads `{t('nav.quiz')}`. */
export function t(key: Key, values?: Record<string, string | number>): string {
	return i18n.t(key, values)
}
