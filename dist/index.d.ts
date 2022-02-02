import { ITSPartialRecord, ITSPickExtra, ITSRequireAtLeastOne } from 'ts-type/lib/type/record';

export interface ISource {
	/**
	 * The source of the the callee
	 */
	source: string;
	line?: string;
	col?: string;
}
export interface ITrace extends ISource {
	raw?: false;
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
export interface IRawLineTrace extends ITSPartialRecord<Exclude<keyof ITrace, "raw" | "indent" | "rawLine">, undefined> {
	raw: true;
	indent?: string;
	rawLine: string;
}
export interface IEvalTrace extends ITrace {
	eval: true;
	callee: "eval";
	evalTrace: ISource;
}
export declare type ITraceValue = IRawLineTrace | ITrace | IEvalTrace;
export interface IParsedWithoutTrace {
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
export interface IParsed extends IParsedWithoutTrace {
	traces: ITraceValue[];
	rawMessage?: string;
	rawTrace?: string[];
	rawStack?: string;
}
export declare function breakBrackets(str: string, first: string, last: string): string[];
export declare function validPosition(source: {
	line?: string | number;
	col?: string | number;
}): boolean;
export declare function parseSource(rawSource: string): ISource;
export declare function parseEvalSource(rawEvalSource: string): Omit<IEvalTrace, "callee" | "calleeNote" | "eval">;
export declare function _detectIndent(trace: string): {
	indent: string;
	rawLine: string;
};
export declare function parseTrace(trace: string, testEvalSource: true): ITrace | IRawLineTrace;
export declare function parseTrace(trace: string, testEvalSource?: false): ITrace;
export declare function parseTrace(trace: string, testEvalSource?: boolean): ITrace | IRawLineTrace;
export declare function isEvalSource(rawSource: string): boolean;
export declare function validTrace(trace: ITraceValue): boolean;
export declare function parseBody(rawStack: string, detectMessage?: string): {
	rawMessage: string;
	rawTrace: string[];
};
export declare function parseMessage(body: string, looseMode?: boolean): IParsedWithoutTrace;
export declare function parseStack(rawStack: string, detectMessage?: string): IParsed;
export declare function formatTrace({ callee, calleeNote, source, line, col, }: ITSPickExtra<ITrace, "source">): string;
export declare function formatEvalTrace({ callee, evalTrace, evalCallee, evalCalleeNote, ...trace }: IEvalTrace): string;
export declare function formatMessagePrefix({ type, code, }: IParsedWithoutTrace): string;
export declare function formatMessage(parsed: IParsedWithoutTrace): string;
export declare function formatRawLineTrace(trace: IRawLineTrace): string;
export declare function isRawLineTrace(trace: ITraceValue): trace is IRawLineTrace;
export declare function isEvalTrace(trace: ITraceValue): trace is IEvalTrace;
export declare function formatTraceLine(trace: ITraceValue): string;
export declare class ErrorStack implements IParsed {
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
	constructor(stack: string, detectMessage?: string);
	/**
	 * filterFunction Function the same as the callback function of Array.prototype.filter(callback)
	 */
	filter(filter: (value: ITraceValue, index: number, array: IParsed["traces"]) => boolean): this;
	/**
	 * Format object parsed
	 */
	format(): string;
}
export declare function formatTraces(traces: IParsed["traces"]): string[];
/**
 * Format object parsed
 */
export declare function stringifyErrorStack(parsed: ITSRequireAtLeastOne<IParsed, "traces" | "rawTrace">): string;
export declare function parseErrorStack(stack: string, detectMessage?: string): ErrorStack;
export default parseErrorStack;

export {};
