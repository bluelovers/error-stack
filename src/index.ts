import { ITSPickExtra } from 'ts-type/lib/type/record';
import { lineSplit } from 'crlf-normalize';
import { IParsed, IParsedWithoutTrace, ITrace } from './types';

const AT = 'at' as const
const CR = '\n' as const

// 1.
// Error: foo
// 2.
// TypeError: foo
const REGEX_MATCH_MESSAGE = /^([a-z][a-z0-9_]*):\s+([\s\S]+)$/i

const REGEX_REMOVE_AT = /^at\s+/
const REGEX_STARTS_WITH_EVAL_AT = /^eval\s+at\s+/

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

	const ret: ITrace = {} as any

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

export function validTrace(trace: ITrace)
{
	return trace.line || trace.eval;
}

export function parse(stack: string): IParsed
{
	const [rawMessage, ...rawTrace] = lineSplit(stack)

	// A error message might have multiple lines
	const index = rawTrace.findIndex(line => line.trimLeft().startsWith(AT) && validTrace(parseTrace(trim(line), true)))

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
}: ITSPickExtra<ITrace, 'source'>)
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
}: ITrace)
{
	return `${callee} (eval at ${formatTrace({
		...trace,
		callee: '<anonymous>',
	})}, ${formatTrace(evalTrace)})`;
}

export function formatMessage({
	type,
	message,
}: IParsedWithoutTrace)
{
	return `${type}: ${message}`;
}

export class ErrorStack implements IParsed
{

	/**
	 * Error type
	 */
	type: string;
	/**
	 * The message used by Error constructor
	 */
	message: string;
	traces: ITrace[];

	constructor(stack: string)
	{
		if (typeof stack !== 'string')
		{
			throw new TypeError('stack must be a string')
		}

		Object.assign(this, parse(stack))
	}

	/**
	 * filterFunction Function the same as the callback function of Array.prototype.filter(callback)
	 */
	filter(filter: (value: ITrace, index: number, array: ITrace[]) => boolean)
	{
		this.traces = this.traces.filter(filter)

		return this
	}

	/**
	 * Format object parsed
	 */
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
