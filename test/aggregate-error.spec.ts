import { parseErrorStack, stringifyErrorStack } from '../src/index';

[
	[
		'AggregateError', 'AggregateError\n' +
	'    at Object.<anonymous> (G:\\Users\\The Project\\fork\\error-stack\\test\\temp2.ts:4:11)\n' +
	'    at Module._compile (node:internal/modules/cjs/loader:1097:14)\n' +
	'    at Module.m._compile (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1371:23)\n' +
	'    at Module._extensions..js (node:internal/modules/cjs/loader:1149:10)\n' +
	'    at Object.require.extensions.<computed> [as .ts] (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1374:12)\n' +
	'    at Module.load (node:internal/modules/cjs/loader:975:32)\n' +
	'    at Function.Module._load (node:internal/modules/cjs/loader:822:12)\n' +
	'    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)\n' +
	'    at main (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:331:12)\n' +
	'    at Object.<anonymous> (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:482:3)',
	],
	[
		'AggregateError: ', 'AggregateError: \n' +
	'    at Object.<anonymous> (G:\\Users\\The Project\\nodejs-yarn\\ws-error\\packages\\lazy-aggregate-error\\test\\temp2.ts:3:9)\n' +
	'    at Module._compile (node:internal/modules/cjs/loader:1097:14)\n' +
	'    at Module.m._compile (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1371:23)\n' +
	'    at Module._extensions..js (node:internal/modules/cjs/loader:1149:10)\n' +
	'    at Object.require.extensions.<computed> [as .ts] (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\index.ts:1374:12)\n' +
	'    at Module.load (node:internal/modules/cjs/loader:975:32)\n' +
	'    at Function.Module._load (node:internal/modules/cjs/loader:822:12)\n' +
	'    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)\n' +
	'    at main (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:331:12)\n' +
	'    at Object.<anonymous> (C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules\\ts-node\\src\\bin.ts:482:3)',
	],
].forEach(([title, e]) =>
{
	test(title, () =>
	{
		let actual = parseErrorStack(e);

		expect(actual).toMatchSnapshot();

		let s = stringifyErrorStack(actual);

		expect(s).toMatchSnapshot();
		expect(s).toStrictEqual(e);
	});

	test(`${title}:02`, () =>
	{
		let actual = parseErrorStack(e, '');

		expect(actual).toMatchSnapshot();

		let s = stringifyErrorStack(actual);

		expect(s).toMatchSnapshot();
		expect(s).toStrictEqual(e);
	});
})





