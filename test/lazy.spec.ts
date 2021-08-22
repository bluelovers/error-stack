import { basename } from 'path';
import {
	parseErrorStack,
	formatTraceLine,
	parseEvalSource,
	parseSource,
	parseTrace,
	stringifyErrorStack, parseMessage, parseBody, validPosition, parseStack, formatMessage,
} from '../src/index';
import { IParsed, ISource } from '../src/types';
import { inspect } from 'util';
import { isNumOnly } from '../src/util/isNumOnly';
import { isUnset } from '../src/util/isUnset';

describe(parseSource.name, () =>
{
	[
		'G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts:6:13',
		'node:internal/modules/cjs/loader:1101:14',
		'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1225:23',
		'node:internal/modules/cjs/loader:1153:10',
		'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1228:12',
		'node:internal/modules/cjs/loader:981:32',
		'node:internal/modules/cjs/loader:822:12',
		'node:internal/modules/run_main:79:12',
		'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:330:12',
		'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:477:3',
	].forEach(line => {
		test(basename(line), () =>
		{
			let actual = parseSource(line);

			_checkPos(actual);

			expect(actual).toMatchSnapshot();
		});
	});

});

describe(parseTrace.name, () =>
{
	[
		'    at new Promise (<anonymous>)',
	].forEach(line => {
		test(basename(line), () =>
		{
			let actual = parseTrace(line);

			expect(actual).toMatchSnapshot();

			let s = formatTraceLine(actual);

			expect(s).toMatchSnapshot();
			expect(s).toStrictEqual(line);

		});
	});
});

describe('parseEvalSource', () =>
{
	[
		'eval at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\error-stack.test.ts:41:5), <anonymous>:1:1',
	].forEach(line => {
		test(basename(line), () =>
		{
			let actual = parseEvalSource(line);

			_checkPos(actual);

			expect(actual).toMatchSnapshot();

			_checkPos(actual.evalTrace);
		});
	})

});

describe(parseErrorStack.name, () =>
{
	[
		"Error: foo:eval\n    at eval (eval at <anonymous> (:1:1), <anonymous>:1:1)\n    at <anonymous>:1:1",

		`Error: foo:eval
    at eval (eval at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\error-stack.test.ts:41:5), <anonymous>:1:1)
    at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\error-stack.test.ts:41:5)
    at Runtime._execModule (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-runtime\\build\\index.js:1394:24)
    at Runtime._loadModule (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-runtime\\build\\index.js:996:12)
    at Runtime.requireModule (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-runtime\\build\\index.js:828:12)
    at jestAdapter (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-circus\\build\\legacy-code-todo-rewrite\\jestAdapter.js:79:13)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at runTestInternal (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-runner\\build\\runTest.js:389:16)
    at runTest (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-runner\\build\\runTest.js:481:34)
    at Object.worker (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\jest\\node_modules\\jest-runner\\build\\testWorker.js:133:12)`,

		`AggregateErrorExtra: ggregateError:
    at Object
    at Object.<anonymous> (G:\\Users\\The Project\\nodejs-yarn\\ws-error\\packages\\lazy-aggregate-error\\test\\temp.ts:9:9)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Module.m._compile (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1225:23)
    at Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Object.require.extensions.<computed> [as .ts] (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1228:12)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12)
    at main (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:330:12)
    at Object.<anonymous> (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:477:3)`,

		`Error: 
    at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts:31:16)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Module.m._compile (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1225:23)
    at Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Object.require.extensions.<computed> [as .ts] (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1228:12)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12)
    at main (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:330:12)
    at Object.<anonymous> (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:477:3)`,

	].forEach(stack => {
		test(stack, () =>
		{
			let actual = parseErrorStack(stack);

			expect(actual).toMatchSnapshot();

			let s = stringifyErrorStack(actual);
			expect(s).toStrictEqual(stack);
		});
	})

});

describe(parseMessage.name, () =>
{
	[
		'Error: ',
		`AssertionError [ERR_ASSERTION]: 'CID(QmQndiGjG2YFoUfYPtLsy3RcTxPVuFRmEZFE2WAEtSYh3x)' isSameCID "'/ipfs/QmSJF5DHa4
XogNVQh1AH1UTGM9QN1ZqAywEgvPrfPP9f28'"`,
	].forEach(line => {
		test(basename(line), () =>
		{
			let actual = parseMessage(line);

			expect(actual).toMatchSnapshot();

			let s = formatMessage(actual);

			expect(line.startsWith(s)).toBeTruthy()
		});
	})

});

describe(parseBody.name, () =>
{
	[

		`Error:
    at G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts:20:8
    at new Promise (<anonymous>)
    at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts:19:1)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)`,

		`Error:`,

	].forEach(line =>
	{
		test(basename(line), () =>
		{
			let actual = parseBody(line);

			expect(actual).toMatchSnapshot();

		});
	})

});

describe(validPosition.name, () =>
{
	describe('true', () =>
	{

		[

			{
				line: 1,
				col: '2',
			},

			{
				line: '1',
				col: '2',
			},

			{
				line: 1,
				col: '2',
			},

			{
				line: 1,
				col: 2,
			},

		].forEach(line =>
		{
			test(inspect(line), () =>
			{
				let actual = validPosition(line);

				expect(actual).toBeTruthy();

			});
		});

	});

	describe('false', () =>
	{

		[

			{
				line: void 0,
				col: 2,
			},

			{
				line: null,
				col: 2,
			},

			{
				line: void 0,
				col: null,
			},

			{},

			null,

			{
				line: '0',
				col: '+2',
			},

			{
				line: '0',
				col: '1e',
			},

		].forEach(line =>
		{
			test(inspect(line), () =>
			{
				let actual = validPosition(line as any);

				expect(actual).toBeFalsy();

			});
		});

	});

});

describe(isNumOnly.name, () =>
{
	describe('true', () =>
	{

		[

			1,
			'1',

		].forEach(line =>
		{
			test(inspect(line), () =>
			{
				let actual = isNumOnly(line);

				expect(actual).toBeTruthy();

			});
		});

	});

	describe('false', () =>
	{

		[

			void 0,
			null,

			1.1,

		].forEach(line =>
		{
			test(inspect(line), () =>
			{
				let actual = isNumOnly(line as any);

				expect(actual).toBeFalsy();

			});
		});

	});

});

describe(parseStack.name, () =>
{
	([

		[
			[`AggregateError: ggregateError:
    at Object.<anonymous> (<anonymous>:19:1)
    at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts:11:9)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Module.m._compile (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1225:23)
    at Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Object.require.extensions.<computed> [as .ts] (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1228:12)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12)
    at main (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:330:12)
    at Object.<anonymous> (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:477:3)`,
				'ggregateError:\n' +
				'    at Object.<anonymous> (<anonymous>:19:1)'], {

			message: 'ggregateError:\n    at Object.<anonymous> (<anonymous>:19:1)',

		}],

		[
			[
				`AggregateError: 
    Error: foo
        at Object.<anonymous> (/Users/sindresorhus/dev/aggregate-error/example.js:3:33)
    Error: bar
        at Object.<anonymous> (/Users/sindresorhus/dev/aggregate-error/example.js:3:13)
    Error: baz
        at Object.<anonymous> (/Users/sindresorhus/dev/aggregate-error/example.js:3:13)
    at AggregateError (/Users/sindresorhus/dev/aggregate-error/index.js:19:3)
    at Object.<anonymous> (/Users/sindresorhus/dev/aggregate-error/example.js:3:13)`]
		]

	] as [[string, string?], any?][]).forEach(line =>
	{
		test(basename(line[0][0]), () =>
		{
			let actual = parseStack(...line[0]);

			if (isUnset(line[1]))
			{
				expect(actual).toMatchSnapshot();
			}
			else
			{
				expect(actual).toMatchSnapshot(line[1]);
			}

			expect(stringifyErrorStack(actual)).toStrictEqual(line[0][0])

		});
	})

});

describe(stringifyErrorStack.name, () =>
{
	([

		{
			"type": "AggregateErrorExtra",
			"message": "ggregateError: \nat Object",
			traces: [
				{
					callee: 'Object.<anonymous>',
					calleeNote: undefined,
					source: 'G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts',
					line: '11',
					col: '9',
					indent: '    '
				},
				{
					callee: 'Module._compile',
					calleeNote: undefined,
					source: 'node:internal/modules/cjs/loader',
					line: '1101',
					col: '14',
					indent: '    '
				},
				{
					callee: 'Module.m._compile',
					calleeNote: undefined,
					source: 'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts',
					line: '1225',
					col: '23',
					indent: '    '
				},
				{
					callee: 'Module._extensions..js',
					calleeNote: undefined,
					source: 'node:internal/modules/cjs/loader',
					line: '1153',
					col: '10',
					indent: '    '
				},
				{
					callee: 'Object.require.extensions.<computed>',
					calleeNote: 'as .ts',
					source: 'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts',
					line: '1228',
					col: '12',
					indent: '    '
				},
				{
					callee: 'Module.load',
					calleeNote: undefined,
					source: 'node:internal/modules/cjs/loader',
					line: '981',
					col: '32',
					indent: '    '
				},
				{
					callee: 'Function.Module._load',
					calleeNote: undefined,
					source: 'node:internal/modules/cjs/loader',
					line: '822',
					col: '12',
					indent: '    '
				},
				{
					callee: 'Function.executeUserEntryPoint',
					calleeNote: 'as runMain',
					source: 'node:internal/modules/run_main',
					line: '79',
					col: '12',
					indent: '    '
				},
				{
					callee: 'main',
					calleeNote: undefined,
					source: 'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts',
					line: '330',
					col: '12',
					indent: '    '
				},
				{
					callee: 'Object.<anonymous>',
					calleeNote: undefined,
					source: 'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts',
					line: '477',
					col: '3',
					indent: '    '
				}
			],
		},

		{
			"type": "AggregateErrorExtra",
			"message": "ggregateError: \nat Object",
			rawTrace: [
				'    at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\temp.ts:11:9)',
				'    at Module._compile (node:internal/modules/cjs/loader:1101:14)',
				'    at Module.m._compile (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1225:23)',
				'    at Module._extensions..js (node:internal/modules/cjs/loader:1153:10)',
				'    at Object.require.extensions.<computed> [as .ts] (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1228:12)',
				'    at Module.load (node:internal/modules/cjs/loader:981:32)',
				'    at Function.Module._load (node:internal/modules/cjs/loader:822:12)',
				'    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12)',
				'    at main (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:330:12)',
				'    at Object.<anonymous> (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:477:3)'
			],
		},

	] as Partial<IParsed>[]).forEach(line =>
	{
		test(inspect(line), () =>
		{
			let actual = stringifyErrorStack(line as any);

			expect(actual).toMatchSnapshot();

		});
	})

});

function _checkPos(source: ISource)
{
	expect(String(source.line)).toMatch(/^\d+$/);
	expect(String(source.col)).toMatch(/^\d+$/);
}
