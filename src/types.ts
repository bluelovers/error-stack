import { ITSPartialRecord } from 'ts-type/lib/type/record';

export interface ISource
{
	/**
	 * The source of the the callee
	 */
	source: string
	line?: string
	col?: string
}

export interface ITrace extends ISource
{
	raw?: false

	callee: string
	calleeNote?: string
	/**
	 * Whether the callee is 'eval'
	 */
	eval?: boolean

	evalCallee?: string
	evalCalleeNote?: string

	/**
	 * The source location inside eval content
	 */
	evalTrace?: ISource

	indent?: string,
}

export interface IRawLineTrace extends ITSPartialRecord<Exclude<keyof ITrace, 'raw' | 'indent' | 'rawLine'>, undefined>
{
	raw: true
	indent?: string,
	rawLine: string,
}

export interface IEvalTrace extends ITrace
{
	eval: true
	callee: "eval",
	evalTrace: ISource
}

export type ITraceValue = IRawLineTrace | ITrace | IEvalTrace;

export interface IParsedWithoutTrace
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
}

export interface IParsed extends IParsedWithoutTrace
{
	traces: ITraceValue[];

	rawMessage?: string,
	rawTrace?: string[],
	rawStack?: string,
}
