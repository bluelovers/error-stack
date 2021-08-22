// Generated by dts-bundle-generator v5.9.0

import { ITSPickExtra, ITSRequireAtLeastOne } from 'ts-type/lib/type/record';

export interface ISource {
	/**
	 * The source of the the callee
	 */
	source: string;
	line?: string;
	col?: string;
}
export interface ITrace extends ISource {
	callee: string;
	calleeNote?: string;
	/**
	 * Whether the callee is 'eval'
	 */
	eval?: boolean;
	evalCallee?: string;
	evalCalleeNote?: string;
	/**
	 * The source location inside eval content
	 */
	evalTrace?: ISource;
	indent?: string;
}
export interface IParsedWithoutTrace {
	/**
	 * Error type
	 */
	type: string;
	/**
	 * The message used by Error constructor
	 */
	message: string;
}
export interface IParsed extends IParsedWithoutTrace {
	traces: ITrace[];
	rawMessage?: string;
	rawTrace?: string[];
	rawStack?: string;
}
export declare function breakBrackets(str: string, first: string, last: string): string[];
export declare function validPosition(source: {
	line: string | number;
	col: string | number;
}): boolean;
export declare function parseSource(rawSource: string): ISource;
export declare function parseEvalSource(rawEvalSource: string): Omit<ITrace, "callee" | "calleeNote" | "eval">;
export declare function _detectIndent(trace: string): {
	indent: string;
	line: string;
};
export declare function parseTrace(trace: string, testEvalSource?: boolean): ITrace;
export declare function validTrace(trace: ITrace): boolean;
export declare function parseBody(rawStack: string, detectMessage?: string): {
	rawMessage: string;
	rawTrace: string[];
};
export declare function parseMessage(body: string): IParsedWithoutTrace;
export declare function parseStack(rawStack: string, detectMessage?: string): IParsed;
export declare function formatTrace({ callee, calleeNote, source, line, col, }: ITSPickExtra<ITrace, "source">): string;
export declare function formatEvalTrace({ callee, evalTrace, evalCallee, evalCalleeNote, ...trace }: ITrace): string;
export declare function formatMessage({ type, message, }: IParsedWithoutTrace): string;
export declare function formatLineTrace(trace: ITrace): string;
export declare class ErrorStack implements IParsed {
	/**
	 * Error type
	 */
	type: string;
	/**
	 * The message used by Error constructor
	 */
	message: string;
	traces: ITrace[];
	readonly rawStack?: string;
	constructor(stack: string, detectMessage?: string);
	/**
	 * filterFunction Function the same as the callback function of Array.prototype.filter(callback)
	 */
	filter(filter: (value: ITrace, index: number, array: ITrace[]) => boolean): this;
	/**
	 * Format object parsed
	 */
	format(): string;
}
/**
 * Format object parsed
 */
export declare function stringifyErrorStack(parsed: ITSRequireAtLeastOne<IParsed, "traces" | "rawTrace">): string;
export declare function parseErrorStack(stack: string, detectMessage?: string): ErrorStack;
export default parseErrorStack;

export {};
