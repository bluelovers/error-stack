import { ITSPickExtra, ITSRequireAtLeastOne } from 'ts-type/lib/type/record';
import { lineSplit, R_CRLF, LF } from 'crlf-normalize';
import { IEvalTrace, IParsed, IParsedWithoutTrace, ISource, ITrace, IRawLineTrace, ITraceValue } from './types';
import { stringSplitWithLimit } from 'string-split-keep2';
import { trim } from './util/trim';
import { isUnset } from './util/isUnset';
import { isNumOnly } from './util/isNumOnly';
import errcode from 'err-code';
import { inspect } from 'util';

const AT = 'at' as const

// 1.
// Error: foo
// 2.
// TypeError: foo
const REGEX_MATCH_MESSAGE = /^([a-z][a-z0-9_]*)(?:(?: \[(\w+)\])?:(?: ([\s\S]*))?)?$/i

const REGEX_MATCH_MESSAGE_LOOSE = new RegExp(REGEX_MATCH_MESSAGE.source, REGEX_MATCH_MESSAGE.flags + 'm');

const REGEX_REMOVE_AT = /^at\s+/
const REGEX_STARTS_WITH_EVAL_AT = /^eval\s+at\s+/

const REGEX_MATCH_INDENT = /^([ \t]*)(.+)$/;

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

export function validPosition(source: {
	line?: string | number,
	col?: string | number,
})
{
	if (!isUnset(source))
	{
		if (typeof source === 'object' && isUnset(source.line) && isUnset(source.col))
		{
			return null
		}

		return isNumOnly(source.line) && isNumOnly(source.col)
	}

	return false
}

export function parseSource(rawSource: string): ISource
{
	const [source, line, col] = stringSplitWithLimit(rawSource, ':', -3);

	if (!col?.length || !line?.length)
	{
		return {
			source: rawSource,
		}
	}

	return {
		source,
		line,
		col,
	}
}

export function parseEvalSource(rawEvalSource: string): Omit<IEvalTrace, 'callee' | 'calleeNote' | 'eval'>
{
	const { indent, rawLine } = _detectIndent(rawEvalSource);

	const [rawTrace, rawEvalTrace] = rawLine
		.replace(REGEX_STARTS_WITH_EVAL_AT, '')
		.split(/,\s+/g)
		.map(trim)

	const {
		eval: ev,
		callee: evalCallee,
		calleeNote: evalCalleeNote,
		...trace
	} = parseTrace(rawTrace)

	const evalTrace = parseSource(rawEvalTrace)

	return {
		evalCallee,
		evalCalleeNote,
		...trace,
		evalTrace,
		indent,
	}
}

export function _detectIndent(trace: string)
{
	const [, indent, rawLine] = REGEX_MATCH_INDENT.exec(trace)

	return {
		indent,
		rawLine,
	}
}

export function parseTrace(trace: string, testEvalSource: true): ITrace | IRawLineTrace
export function parseTrace(trace: string, testEvalSource?: false): ITrace
export function parseTrace(trace: string, testEvalSource?: boolean): ITrace | IRawLineTrace
export function parseTrace(trace: string, testEvalSource?: boolean)
{
	const { indent, rawLine } = _detectIndent(trace);

	const t = rawLine.replace(REGEX_REMOVE_AT, '')

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

	if (testEvalSource === true)
	{
		if (!rawLine.startsWith(AT))
		{
			return <IRawLineTrace>{
				raw: true,
				indent,
				rawLine,
			}
		}
	}

	Object.assign(
		ret,
		testEvalSource && isEvalSource(rawSource)
			? parseEvalSource(rawSource)
			: parseSource(rawSource),
	)

	if (testEvalSource === true)
	{
		if (!validTrace(ret))
		{
			return <IRawLineTrace>{
				raw: true,
				indent,
				rawLine,
			}
		}
	}

	ret.indent = indent

	return ret
}

export function isEvalSource(rawSource: string)
{
	return REGEX_STARTS_WITH_EVAL_AT.test(rawSource)
}

export function validTrace(trace: ITraceValue)
{
	if (isRawLineTrace(trace))
	{
		return false;
	}

	return trace.eval || isNumOnly(trace.line) || isUnset(trace.callee) && trace.source?.length > 0 && validPosition(trace);
}

export function parseBody(rawStack: string, detectMessage?: string)
{
	let rawTrace: string[];
	let rawMessage: string

	if (!isUnset(detectMessage))
	{
		let { type, message } = parseMessage(rawStack, true);

		let mf = formatMessage({
			type,
			message: detectMessage === '' ? message : detectMessage,
		});

		let i = rawStack.indexOf(mf)

		if (i === 0)
		{
			let s = rawStack.replace(mf, '')
			let m = R_CRLF.exec(s)

			if (m?.index === 0)
			{
				rawTrace = lineSplit(m.input.replace(m[0], ''));

				rawMessage = mf
			}
		}
	}

	if (!rawMessage?.length)
	{
		([rawMessage, ...rawTrace] = lineSplit(rawStack));

		// A error message might have multiple lines
		const index = rawTrace.findIndex(line => line.trimLeft()
			.startsWith(AT) && validTrace(parseTrace(trim(line), true)));

		rawMessage = [rawMessage, ...rawTrace.splice(0, index)].join(LF)
	}

	return {
		rawMessage,
		rawTrace,
	}
}

export function parseMessage(body: string, looseMode?: boolean): IParsedWithoutTrace
{
	try
	{
		const [, type, code, message] = body.match(looseMode ? REGEX_MATCH_MESSAGE_LOOSE : REGEX_MATCH_MESSAGE);

		return {
			type,
			code,
			message,
		}
	}
	catch (e: any)
	{
		e.message = `Failed to parse error message.\nreason: ${e.message}\nbody=${inspect(body)}`;

		errcode(e, {
			body,
		});

		throw e
	}
}

export function parseStack(rawStack: string, detectMessage?: string): IParsed
{
	if (typeof rawStack !== 'string')
	{
		throw errcode(new TypeError('stack must be a string'), {
			rawStack,
			detectMessage,
		});
	}

	try
	{
		const { rawMessage, rawTrace } = parseBody(rawStack, detectMessage);

		const {
			type, code, message,
		} = parseMessage(rawMessage)

		const traces = rawTrace.map(t => parseTrace(t, true))

		return {
			type,
			code,
			message,
			traces,
			rawMessage,
			rawTrace,
			rawStack,
		}
	}
	catch (e: any)
	{
		errcode(e, {
			rawStack,
			detectMessage,
		});

		throw e;
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
		.filter(v => typeof v !== 'undefined')
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

	evalCallee,
	evalCalleeNote,

	...trace
}: IEvalTrace)
{
	return `${callee} (eval at ${formatTrace({
		...trace,

		callee: evalCallee ?? '<anonymous>',
		calleeNote: evalCalleeNote,
	})}, ${formatTrace(evalTrace)})`;
}

export function formatMessagePrefix({
	type,
	code,
}: IParsedWithoutTrace)
{
	if (code?.length)
	{
		type += ` [${code}]`;
	}

	return `${type}`;
}

export function formatMessage(parsed: IParsedWithoutTrace)
{
	let line = formatMessagePrefix(parsed);

	if (typeof parsed.message !== 'undefined')
	{
		line += `: ${parsed.message ?? ''}`;
	}

	return line;
}

export function formatRawLineTrace(trace: IRawLineTrace)
{
	return `${trace.indent ?? '    '}${trace.rawLine}`
}

export function isRawLineTrace(trace: ITraceValue): trace is IRawLineTrace
{
	return (trace.raw === true)
}

export function isEvalTrace(trace: ITraceValue): trace is IEvalTrace
{
	return (trace as IEvalTrace).eval === true
}

export function formatTraceLine(trace: ITraceValue)
{
	if (isRawLineTrace(trace))
	{
		return formatRawLineTrace(trace)
	}

	return `${trace.indent ?? '    '}at ${
		isEvalTrace(trace)
			? formatEvalTrace(trace)
			: formatTrace(trace)
	}`
}

export class ErrorStack implements IParsed
{

	/**
	 * Error type
	 */
	type: string;

	code?: string;
	/**
	 * The message used by Error constructor
	 */
	message: string;
	traces: IParsed["traces"];

	readonly rawMessage?: string;
	readonly rawTrace?: string[];
	readonly rawStack?: string;

	constructor(stack: string, detectMessage?: string)
	{
		Object.assign(this, parseStack(stack, detectMessage))
	}

	/**
	 * filterFunction Function the same as the callback function of Array.prototype.filter(callback)
	 */
	filter(filter: (value: ITraceValue, index: number, array: IParsed["traces"]) => boolean)
	{
		this.traces = this.traces.filter(filter)

		return this
	}

	/**
	 * Format object parsed
	 */
	format()
	{
		return stringifyErrorStack(this)
	}
}

export function formatTraces(traces: IParsed["traces"])
{
	return traces?.map(formatTraceLine)
}

/**
 * Format object parsed
 */
export function stringifyErrorStack(parsed: ITSRequireAtLeastOne<IParsed, 'traces' | 'rawTrace'>)
{
	const messageLines = `${formatMessage(parsed)}`
	const tracesLines = (parsed.traces?.map(formatTraceLine) ?? parsed.rawTrace)
		.join(LF)
	;

	return tracesLines
		? messageLines + LF + tracesLines
		: messageLines
}

export function parseErrorStack(stack: string, detectMessage?: string)
{
	return new ErrorStack(stack, detectMessage)
}

export default parseErrorStack
