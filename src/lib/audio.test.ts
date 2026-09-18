import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { audio, sfx, type Sfx } from './audio.svelte'
import { secureRandom } from './random'

vi.mock('./random', () => ({ secureRandom: vi.fn(() => 0.2) }))

class Param {
	value = 0
	setValueAtTime = vi.fn()
	exponentialRampToValueAtTime = vi.fn()
	cancelScheduledValues = vi.fn()
}

class Node {
	gain = new Param()
	frequency = new Param()
	detune = new Param()
	Q = new Param()
	delayTime = new Param()
	type = ''
	connect = vi.fn()
	disconnect = vi.fn()
	start = vi.fn()
	stop = vi.fn()
	onended: (() => void) | null = null
}

class Context {
	static instances: Context[] = []
	state = 'running'
	currentTime = 10
	destination = new Node()
	nodes: Node[] = []
	oscillators: Node[] = []
	constructor() {
		Context.instances.push(this)
	}
	createGain = vi.fn(() => this.node())
	createBiquadFilter = vi.fn(() => this.node())
	createDelay = vi.fn(() => this.node())
	createOscillator = vi.fn(() => {
		const node = this.node()
		this.oscillators.push(node)
		return node
	})
	resume = vi.fn(async () => {
		this.state = 'running'
	})
	close = vi.fn(async () => {
		this.state = 'closed'
	})
	private node() {
		const node = new Node()
		this.nodes.push(node)
		return node
	}
}

let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> }
const context = () => Context.instances.at(-1)!

beforeEach(() => {
	vi.useFakeTimers()
	Context.instances = []
	storage = { getItem: vi.fn(() => null), setItem: vi.fn() }
	vi.stubGlobal('localStorage', storage)
	vi.stubGlobal('window', { AudioContext: Context })
	vi.mocked(secureRandom).mockReturnValue(0.2)
	audio.hydrate()
})

afterEach(() => {
	audio.dispose()
	vi.runOnlyPendingTimers()
	vi.useRealTimers()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('audio preferences and availability', () => {
	it('defaults to silent music and enabled effects, including SSR', () => {
		vi.stubGlobal('localStorage', undefined)
		vi.stubGlobal('window', undefined)
		audio.hydrate()
		expect(audio.music).toBe(false)
		expect(audio.sfx).toBe(true)
		audio.setMusic(true)
		audio.setSfx(true)
		sfx('select')
		expect(audio.ready).toBe(false)
		expect(Context.instances).toHaveLength(0)
	})
	it('restores and persists independent preferences', () => {
		storage.getItem.mockImplementation((key) => (key === 'tantore-music' ? 'on' : 'off'))
		audio.hydrate()
		expect(audio.music).toBe(true)
		expect(audio.sfx).toBe(false)
		sfx('select')
		expect(Context.instances).toHaveLength(0)
		audio.setMusic(false)
		audio.setSfx(true)
		expect(storage.setItem).toHaveBeenCalledWith('tantore-music', 'off')
		expect(storage.setItem).toHaveBeenCalledWith('tantore-sfx', 'on')
		expect(audio.ready).toBe(true)
	})
	it('stays silent when Web Audio is unsupported or construction fails', () => {
		vi.stubGlobal('window', {})
		audio.unlock()
		sfx('pass')
		expect(audio.ready).toBe(false)
		vi.stubGlobal('window', {
			AudioContext: class {
				constructor() {
					throw new Error('unavailable')
				}
			},
		})
		audio.unlock()
		expect(audio.ready).toBe(false)
	})
	it('supports the prefixed context, resumes it and reuses it', () => {
		vi.stubGlobal('window', { webkitAudioContext: Context })
		audio.unlock()
		context().state = 'suspended'
		audio.unlock()
		expect(context().resume).toHaveBeenCalledOnce()
		context().state = 'suspended'
		sfx('tick')
		expect(context().resume).toHaveBeenCalledTimes(2)
		expect(Context.instances).toHaveLength(1)
		context().state = 'closed'
		audio.unlock()
		expect(audio.ready).toBe(false)
	})
	it('closes and releases a context, even if close rejects', async () => {
		audio.unlock()
		const old = context()
		old.close.mockRejectedValueOnce(new Error('already closed'))
		audio.dispose()
		await Promise.resolve()
		expect(old.close).toHaveBeenCalledOnce()
		expect(audio.ready).toBe(false)
		audio.unlock()
		expect(context()).not.toBe(old)
	})
})

describe('sound effects', () => {
	it.each<[Sfx, number]>([
		['select', 1],
		['tick', 1],
		['correct', 2],
		['wrong', 2],
		['pass', 8],
		['fail', 4],
	])('schedules and cleans up %s (%i notes)', (name, notes) => {
		sfx(name)
		const ctx = context()
		expect(ctx.oscillators).toHaveLength(notes * 2)
		for (const osc of ctx.oscillators) {
			const at = osc.start.mock.calls[0][0]
			expect(at).toBeGreaterThanOrEqual(ctx.currentTime)
			expect(osc.stop.mock.calls[0][0]).toBeGreaterThan(at)
			expect(osc.frequency.value).toBeGreaterThan(0)
			osc.onended?.()
		}
		for (const node of ctx.nodes.slice(1)) expect(node.disconnect).toHaveBeenCalledOnce()
	})
	it('makes success rise, failure fall and bends the final failure note', () => {
		sfx('correct')
		let voices = context().oscillators
		expect(voices[2].frequency.value).toBeGreaterThan(voices[0].frequency.value)
		audio.dispose()
		sfx('fail')
		voices = context().oscillators
		expect(voices[2].frequency.value).toBeLessThan(voices[0].frequency.value)
		for (const osc of voices.slice(-2)) {
			expect(osc.type).toBe('sine')
			expect(osc.frequency.exponentialRampToValueAtTime.mock.calls[0][0]).toBeLessThan(
				osc.frequency.value,
			)
		}
	})
})

describe('music scheduler', () => {
	it.each([0.2, 0.6, 0.8])('keeps notes in range with phrase gaps (random %s)', (random) => {
		vi.mocked(secureRandom).mockReturnValue(random)
		audio.setMusic(true)
		const ctx = context()
		for (let i = 0; i < 250; i++) {
			ctx.currentTime += 0.4
			vi.advanceTimersByTime(400)
		}
		const melody = ctx.oscillators.filter(
			(osc) => osc.type === 'triangle' && osc.detune.value === 0,
		)
		expect(melody.length).toBeGreaterThan(15)
		for (const osc of melody) {
			expect(osc.frequency.value).toBeGreaterThanOrEqual(220)
			expect(osc.frequency.value).toBeLessThanOrEqual(220 * 2 ** (26 / 12))
		}
		const intervals = melody
			.slice(1)
			.map((osc, i) => osc.start.mock.calls[0][0] - melody[i].start.mock.calls[0][0])
		expect(intervals.some((gap) => gap >= 3.5)).toBe(true)
		expect(intervals.some((gap) => gap >= 0.9 && gap <= 1.8)).toBe(true)
		const bass = ctx.oscillators.filter((osc) => osc.type === 'sine')
		expect(bass.length > 0).toBe(random < 0.55)
		for (const osc of ctx.oscillators) osc.onended?.()
		for (const osc of ctx.oscillators) expect(osc.disconnect).toHaveBeenCalledOnce()
	})
	it('does not duplicate loops and fades out before disconnecting its own graph', () => {
		audio.setMusic(true)
		const ctx = context()
		const bus = ctx.nodes[1]
		const graph = ctx.nodes.slice(1)
		audio.unlock()
		audio.setMusic(true)
		expect(ctx.createDelay).toHaveBeenCalledOnce()
		expect(vi.getTimerCount()).toBe(1)
		vi.advanceTimersByTime(400)
		const notes = ctx.oscillators.length
		audio.setMusic(false)
		expect(bus.gain.cancelScheduledValues).toHaveBeenCalledWith(10)
		expect(bus.gain.exponentialRampToValueAtTime).toHaveBeenLastCalledWith(0.0001, 11.2)
		expect(bus.disconnect).not.toHaveBeenCalled()
		vi.advanceTimersByTime(1600)
		expect(ctx.oscillators).toHaveLength(notes)
		for (const node of graph) expect(node.disconnect).toHaveBeenCalledOnce()
		expect(vi.getTimerCount()).toBe(0)
	})
})
