import { ITSPickExtra } from 'ts-type/lib/type/record';

const AT = 'at'
const CR = '\n'

// 1.
// Error: foo
// 2.
// TypeError: foo
const REGEX_MATCH_MESSAGE = /^([a-z][a-z0-9_]*):\s+([\s\S]+)$/i

const REGEX_REMOVE_AT = /^at\s+/
const REGEX_STARTS_WITH_EVAL_AT = /^eval\s+at\s+/

export interface Source {
	// The source of the the callee
	source: string
	line?: number
	col?: number
}

export interface Trace extends Source{
	callee: string
	calleeNote?: string
	// Whether the callee is 'eval'
	eval?: boolean
	// The source location inside eval content
	evalTrace: Source
}

function trim(s: string)
{
	return s.trim();
}

export function breakBrackets(str: string, first: string, last: string)
{
	if (!str.endsWith(last))
	{
		return [str]
	}

	let firstIndex
	let cursor = str.length - 1
	// There is already the last one
	let count = 1
	while (--cursor >= 0)
	{
		const char = str.charAt(cursor)
		if (char === last)
		{
			count++
		}
		else if (char === first)
		{
			if (--count === 0)
			{
				firstIndex = cursor
				break
			}
		}
	}

	return [
		str.slice(0, firstIndex),
		str.slice(firstIndex + 1, -1),
	].map(trim)
}

export function parseSource(rawSource: string)
{
	const [source, line, col] = rawSource.split(':')
	return {
		source, line, col,
	}
}

export function parseEvalSource(rawEvalSource: string)
{
	const [rawTrace, rawEvalTrace] = rawEvalSource
		.replace(REGEX_STARTS_WITH_EVAL_AT, '')
		.split(/,\s+/g)
		.map(trim)

	const {
		source,
		line,
		col,
		// eslint-disable-next-line no-use-before-define
	} = parseTrace(rawTrace)

	const evalTrace = parseSource(rawEvalTrace)

	return {
		source,
		line,
		col,
		evalTrace,
	}
}

export function parseTrace(trace: string, testEvalSource?: boolean)
{
	const t = trace.replace(REGEX_REMOVE_AT, '')

	let [
		rawCallee, rawSource,
	] = breakBrackets(t, '(', ')')

	if (!rawSource)
	{
		[rawCallee, rawSource] = [rawSource, rawCallee]
	}

	const ret: Trace = {} as any

	if (rawCallee)
	{
		const [
			callee, calleeNote,
		] = breakBrackets(rawCallee, '[', ']')

		ret.callee = callee
		ret.calleeNote = calleeNote
	}
	else
	{
		ret.callee = rawCallee
	}

	if (ret.callee === 'eval')
	{
		ret.eval = true
	}

	Object.assign(
		ret,
		testEvalSource && REGEX_STARTS_WITH_EVAL_AT.test(rawSource)
			? parseEvalSource(rawSource)
			: parseSource(rawSource),
	)

	return ret
}

export function parse(stack: string)
{
	const [rawMessage, ...rawTrace] = stack.split(/\r|\n/g)

	// A error message might have multiple lines
	const index = rawTrace.findIndex(line => line.trimLeft().startsWith(AT))

	const messageLines = [rawMessage, ...rawTrace.splice(0, index)]

	const [, type, message] = messageLines.join(CR).match(REGEX_MATCH_MESSAGE)
	const traces = rawTrace.map(t => parseTrace(trim(t), true))

	return {
		type, message, traces,
	}
}

export function formatTrace({
	callee,
	calleeNote,
	source,
	line,
	col,
}: ITSPickExtra<Trace, 'source'>)
{
	const sourceTrace = [
		source,
		line,
		col,
	]
		.filter(Boolean)
		.join(':')

	const note = calleeNote
		? ` [${calleeNote}]`
		: ''

	return callee
		? `${callee}${note} (${sourceTrace})`
		: sourceTrace
}

export function formatEvalTrace({
	callee,
	evalTrace,
	...trace
}: Trace)
{
	return `${callee} (eval at ${formatTrace({
		...trace,
		callee: '<anonymous>',
	})}, ${formatTrace(evalTrace)})`;
}

export function formatMessage({
	type,
	message,
}: {
	type: string;
	message: string;
})
{
	return `${type}: ${message}`;
}

export class ErrorStack
{
	type: string;
	message: string;
	traces: Trace[];

	constructor(stack: string)
	{
		if (typeof stack !== 'string')
		{
			throw new TypeError('stack must be a string')
		}

		Object.assign(this, parse(stack))
	}

	filter(filter: (value: Trace, index: number, array: Trace[]) => boolean)
	{
		this.traces = this.traces.filter(filter)

		return this
	}

	format()
	{
		const { type, message } = this
		const messageLines = `${formatMessage({ type, message })}`
		const tracesLines = this.traces.map(
				trace => `    at ${
					trace.eval
						? formatEvalTrace(trace)
						: formatTrace(trace)
				}`,
			)
			.join(CR)

		return tracesLines
			? messageLines + CR + tracesLines
			: messageLines
	}
}

export function parseErrorStack(stack: string)
{
	return new ErrorStack(stack)
}

export default parseErrorStack
