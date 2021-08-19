import { basename } from 'path';
import {
	parseErrorStack,
	formatLineTrace,
	parseEvalSource,
	parseSource,
	parseTrace,
	stringifyErrorStack, parseMessage,
} from '../src/index';
import { ISource } from '../src/types';

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
			let actual = parseTrace(line.trim());

			expect(actual).toMatchSnapshot();

			let s = formatLineTrace(actual);

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
	].forEach(line => {
		test(basename(line), () =>
		{
			let actual = parseMessage(line);

			expect(actual).toMatchSnapshot();
			expect(line.indexOf(actual.type + ':')).toStrictEqual(0)
		});
	})

});

function _checkPos(source: ISource)
{
	expect(String(source.line)).toMatch(/^\d+$/);
	expect(String(source.col)).toMatch(/^\d+$/);
}
