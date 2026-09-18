/**
 * Sound, synthesized in the browser.
 *
 * Everything here is generated with Web Audio oscillators — there are no audio
 * files to download, so sound costs the learner nothing on a slow connection
 * and nothing in the bundle.
 *
 * Two independent switches, each remembered in localStorage:
 *   - music: sparse koto-like phrases in hirajoshi, with real silence between
 *   - sfx:   short cues for answering, passing and finishing
 *
 * Browsers refuse to start audio until the visitor has interacted with the
 * page, so the AudioContext is created lazily and `unlock()` is wired to the
 * first gesture. Nothing here throws if audio is unavailable; it just stays
 * silent.
 */

import { secureRandom } from './random'

export type Sfx = 'select' | 'correct' | 'wrong' | 'pass' | 'fail' | 'tick'

const MUSIC_KEY = 'tantore-music'
const SFX_KEY = 'tantore-sfx'

/**
 * Hirajoshi — the standard koto tuning, in semitones from the root. Its minor
 * second is what makes it read as traditionally Japanese rather than as a
 * generic pentatonic.
 */
const HIRAJOSHI = [0, 2, 3, 7, 8]
/** A3. The melody sits above this; the bass note an octave below. */
const ROOT_HZ = 220
/** Semitones from the SFX root, which stays independent of the music scale. */
const SFX_ROOT_HZ = 293.66

/** Quiet enough to study over; this is a room, not a soundtrack. */
const MUSIC_GAIN = 0.11
const SFX_GAIN = 0.3
/** How far ahead the scheduler queues notes, and how often it wakes up. */
const LOOKAHEAD_S = 2.5
const TICK_MS = 400

const rand = (min: number, max: number) => min + secureRandom() * (max - min)

/** Frequency of a scale step, where 5 steps is one octave. */
function scaleHz(step: number) {
	const size = HIRAJOSHI.length
	const octave = Math.floor(step / size)
	const degree = HIRAJOSHI[((step % size) + size) % size]
	return ROOT_HZ * Math.pow(2, (degree + 12 * octave) / 12)
}

function sfxHz(semitones: number) {
	return SFX_ROOT_HZ * Math.pow(2, semitones / 12)
}

function readFlag(key: string, fallback: boolean) {
	if (typeof localStorage === 'undefined') return fallback
	const stored = localStorage.getItem(key)
	return stored === null ? fallback : stored === 'on'
}

class AudioStore {
	/** Music is off by default: sound that starts by itself is an ambush. */
	music = $state(false)
	sfx = $state(true)
	/** True once a real AudioContext exists and is running. */
	ready = $state(false)

	#context: AudioContext | null = null
	#master: GainNode | null = null
	#musicBus: GainNode | null = null
	#musicNodes: AudioNode[] = []
	#timer: ReturnType<typeof setInterval> | null = null
	#nextNoteAt = 0
	/** Position in the scale, in steps; 0 is the root, 5 an octave up. */
	#step = 0
	/** Notes left in the phrase being played. 0 means the next note starts one. */
	#phraseLeft = 0

	/** Called from AppControls once the component is in the browser. */
	hydrate() {
		this.music = readFlag(MUSIC_KEY, false)
		this.sfx = readFlag(SFX_KEY, true)
	}

	/**
	 * Create (or resume) the context. Safe to call on every gesture — it is a
	 * no-op once running.
	 */
	unlock() {
		const context = this.#ensureContext()
		if (!context) return
		if (context.state === 'suspended') void context.resume()
		this.ready = context.state !== 'closed'
		// A gesture is also the first legal moment to start the loop.
		if (this.music) this.#startMusic()
	}

	setMusic(on: boolean) {
		this.music = on
		if (typeof localStorage !== 'undefined') localStorage.setItem(MUSIC_KEY, on ? 'on' : 'off')
		if (on) {
			this.unlock()
			this.#startMusic()
		} else {
			this.#stopMusic()
		}
	}

	setSfx(on: boolean) {
		this.sfx = on
		if (typeof localStorage !== 'undefined') localStorage.setItem(SFX_KEY, on ? 'on' : 'off')
		if (on) this.unlock()
	}

	/** Fire a one-shot cue. Silent when sfx are off or audio is unavailable. */
	play(name: Sfx) {
		if (!this.sfx) return
		const context = this.#ensureContext()
		if (!context || !this.#master) return
		if (context.state === 'suspended') void context.resume()
		const at = context.currentTime + 0.01

		switch (name) {
			case 'select':
				this.#pluck(sfxHz(12), at, 0.12, 0.5)
				break
			case 'tick':
				this.#pluck(sfxHz(7), at, 0.07, 0.3)
				break
			case 'correct':
				// Up a fourth: the shape of a question answered.
				this.#pluck(sfxHz(12), at, 0.28, 0.8)
				this.#pluck(sfxHz(17), at + 0.09, 0.34, 0.8)
				break
			case 'wrong':
				// Down a tone, soft and dull. Never a buzzer.
				this.#pluck(sfxHz(3), at, 0.3, 0.55, 'sine')
				this.#pluck(sfxHz(1), at + 0.1, 0.42, 0.55, 'sine')
				break
			case 'pass':
				// Happy: a major arpeggio running upward, quick and bright, landing
				// on a full major chord. Rising + major is what reads as a win.
				;[0, 4, 7, 12].forEach((semi, i) =>
					this.#pluck(sfxHz(semi + 12), at + i * 0.085, 0.45, 0.75),
				)
				this.#pluck(sfxHz(28), at + 0.34, 0.75, 0.8)
				// The chord underneath turns the climb into an arrival.
				;[12, 16, 19].forEach((semi) => this.#pluck(sfxHz(semi), at + 0.34, 1.1, 0.4))
				break
			case 'fail':
				// Sad: the same idea inverted — a *minor* arpeggio falling instead of
				// rising, slower, soft sine tones, with the last note sagging a
				// semitone as it fades. Downward + minor + a sigh, and gentle enough
				// that it never scolds.
				;[12, 7, 3].forEach((semi, i) => this.#pluck(sfxHz(semi), at + i * 0.2, 0.75, 0.5, 'sine'))
				this.#pluck(sfxHz(0), at + 0.6, 1.3, 0.45, 'sine', sfxHz(-2))
				break
		}
	}

	/** Release everything. Called when the last consumer unmounts. */
	dispose() {
		this.#stopMusic()
		this.#context?.close().catch(() => {})
		this.#context = null
		this.#master = null
		this.ready = false
	}

	#ensureContext(): AudioContext | null {
		if (this.#context) return this.#context
		if (typeof window === 'undefined') return null
		const Ctor =
			window.AudioContext ??
			(window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
		if (!Ctor) return null
		try {
			const context = new Ctor()
			const master = context.createGain()
			master.gain.value = 1
			master.connect(context.destination)
			this.#context = context
			this.#master = master
			this.ready = context.state !== 'closed'
			return context
		} catch {
			return null
		}
	}

	/**
	 * Short cue tone: fast attack, exponential decay, top rolled off.
	 * `bendToHz` slides the pitch across the note — a falling bend is what makes
	 * the failure cue sound like a sigh rather than an error beep.
	 */
	#pluck(
		frequency: number,
		at: number,
		duration: number,
		level: number,
		wave: OscillatorType = 'triangle',
		bendToHz?: number,
	) {
		const context = this.#context
		const target = this.#master
		if (!context || !target) return

		const gain = context.createGain()
		const filter = context.createBiquadFilter()
		filter.type = 'lowpass'
		filter.frequency.value = Math.min(frequency * 6, 5200)
		filter.Q.value = 0.6

		const peak = SFX_GAIN * level
		gain.gain.setValueAtTime(0.0001, at)
		gain.gain.exponentialRampToValueAtTime(peak, at + 0.012)
		gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

		const osc = context.createOscillator()
		osc.type = wave
		osc.frequency.value = frequency
		const shimmer = context.createOscillator()
		shimmer.type = 'sine'
		shimmer.frequency.value = frequency
		shimmer.detune.value = 7

		if (bendToHz && bendToHz > 0) {
			for (const voice of [osc, shimmer]) {
				voice.frequency.setValueAtTime(frequency, at)
				voice.frequency.exponentialRampToValueAtTime(bendToHz, at + duration * 0.9)
			}
		}

		osc.connect(filter)
		shimmer.connect(filter)
		filter.connect(gain)
		gain.connect(target)

		osc.start(at)
		shimmer.start(at)
		osc.stop(at + duration + 0.05)
		shimmer.stop(at + duration + 0.05)
		osc.onended = () => {
			osc.disconnect()
			shimmer.disconnect()
			filter.disconnect()
			gain.disconnect()
		}
	}

	/**
	 * One koto note. The character comes from the filter closing as the note
	 * decays — bright at the pluck, dark as it rings out — which is what makes
	 * it read as a plucked string rather than a held synth tone.
	 */
	#kotoNote(frequency: number, at: number, duration: number, level: number) {
		const context = this.#context
		const bus = this.#musicBus
		if (!context || !bus) return

		const gain = context.createGain()
		gain.gain.setValueAtTime(0.0001, at)
		gain.gain.exponentialRampToValueAtTime(level, at + 0.006)
		gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

		const filter = context.createBiquadFilter()
		filter.type = 'lowpass'
		filter.Q.value = 1.1
		filter.frequency.setValueAtTime(Math.min(frequency * 7, 6000), at)
		filter.frequency.exponentialRampToValueAtTime(
			Math.max(frequency * 1.4, 160),
			at + duration * 0.7,
		)

		// Two voices a few cents apart: the slight beating is what gives a
		// plucked string its body.
		const voices = [0, 6].map((detune) => {
			const osc = context.createOscillator()
			osc.type = 'triangle'
			osc.frequency.value = frequency
			osc.detune.value = detune
			osc.connect(filter)
			osc.start(at)
			osc.stop(at + duration + 0.1)
			return osc
		})

		filter.connect(gain)
		gain.connect(bus)
		voices[0].onended = () => {
			voices.forEach((v) => v.disconnect())
			filter.disconnect()
			gain.disconnect()
		}
	}

	/** A soft low note under the start of a phrase. Felt more than heard. */
	#bassNote(at: number, duration: number) {
		const context = this.#context
		const bus = this.#musicBus
		if (!context || !bus) return

		const gain = context.createGain()
		gain.gain.setValueAtTime(0.0001, at)
		gain.gain.exponentialRampToValueAtTime(0.5, at + 0.5)
		gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

		const filter = context.createBiquadFilter()
		filter.type = 'lowpass'
		filter.frequency.value = 300

		const osc = context.createOscillator()
		osc.type = 'sine'
		osc.frequency.value = ROOT_HZ / 2
		osc.connect(filter)
		filter.connect(gain)
		gain.connect(bus)
		osc.start(at)
		osc.stop(at + duration + 0.1)
		osc.onended = () => {
			osc.disconnect()
			filter.disconnect()
			gain.disconnect()
		}
	}

	#startMusic() {
		const context = this.#ensureContext()
		if (!context || !this.#master || this.#timer) return

		const bus = context.createGain()
		bus.gain.setValueAtTime(0.0001, context.currentTime)
		// Fade in over three seconds so it arrives rather than interrupts.
		bus.gain.exponentialRampToValueAtTime(MUSIC_GAIN, context.currentTime + 3)
		bus.connect(this.#master)
		this.#musicBus = bus

		// A darkening echo stands in for the room a koto would be played in.
		// Without it the notes sound dry and synthetic.
		const delay = context.createDelay(1.5)
		delay.delayTime.value = 0.42
		const feedback = context.createGain()
		feedback.gain.value = 0.26
		const damp = context.createBiquadFilter()
		damp.type = 'lowpass'
		damp.frequency.value = 1800
		const wet = context.createGain()
		wet.gain.value = 0.32

		bus.connect(delay)
		delay.connect(damp)
		damp.connect(feedback)
		feedback.connect(delay)
		damp.connect(wet)
		wet.connect(this.#master)
		this.#musicNodes = [delay, feedback, damp, wet]

		this.#nextNoteAt = context.currentTime + 1
		this.#step = 0
		this.#phraseLeft = 0
		this.#timer = setInterval(() => this.#schedule(), TICK_MS)
	}

	/**
	 * Queue whatever falls inside the lookahead window.
	 *
	 * Notes come in short phrases of two to four, then stop for several seconds.
	 * The silence is the point — 間 — and it is also what keeps this bearable
	 * for the length of a study session rather than for two minutes.
	 */
	#schedule() {
		const context = this.#context
		if (!context || !this.#musicBus) return

		while (this.#nextNoteAt < context.currentTime + LOOKAHEAD_S) {
			const at = this.#nextNoteAt

			if (this.#phraseLeft === 0) {
				this.#phraseLeft = Math.floor(rand(2, 5))
				if (secureRandom() < 0.55) this.#bassNote(at, rand(5, 8))
			}

			// Long decays, quieter as the line climbs, so high notes never poke out.
			const frequency = scaleHz(this.#step)
			const brightness = 1 - Math.min(this.#step, 12) / 24
			this.#kotoNote(frequency, at, rand(3, 4.5), 0.42 * brightness)
			this.#phraseLeft--

			// Mostly stepwise, with the occasional small leap, drifting over a
			// two-octave range rather than running up and down it.
			const move = secureRandom() < 0.7 ? 1 : 2
			this.#step += secureRandom() < 0.5 ? move : -move
			if (this.#step > 11) this.#step -= 5
			if (this.#step < 0) this.#step += 5

			this.#nextNoteAt += this.#phraseLeft > 0 ? rand(0.9, 1.8) : rand(3.5, 6.5)
		}
	}

	#stopMusic() {
		if (this.#timer) {
			clearInterval(this.#timer)
			this.#timer = null
		}
		const context = this.#context
		const bus = this.#musicBus
		if (context && bus) {
			const end = context.currentTime + 1.2
			bus.gain.cancelScheduledValues(context.currentTime)
			bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), context.currentTime)
			bus.gain.exponentialRampToValueAtTime(0.0001, end)
			const trailing = this.#musicNodes
			// Let the echo ring out before tearing the graph down.
			setTimeout(() => {
				trailing.forEach((node) => node.disconnect())
				bus.disconnect()
			}, 1600)
		}
		this.#musicNodes = []
		this.#musicBus = null
	}
}

export const audio = new AudioStore()

/** Shorthand so call sites read `sfx('correct')`. */
export function sfx(name: Sfx) {
	audio.play(name)
}
