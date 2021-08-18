export interface ISource
{
	/**
	 * The source of the the callee
	 */
	source: string
	line?: number
	col?: number
}

export interface ITrace extends ISource
{
	callee: string
	calleeNote?: string
	/**
	 * Whether the callee is 'eval'
	 */
	eval?: boolean
	/**
	 * The source location inside eval content
	 */
	evalTrace: ISource
}

export interface IParsedWithoutTrace
{
	/**
	 * Error type
	 */
	type: string;
	/**
	 * The message used by Error constructor
	 */
	message: string;
}

export interface IParsed extends IParsedWithoutTrace
{
	traces: ITrace[];
}
