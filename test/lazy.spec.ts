import { basename } from 'path';
import { formatLineTrace, parseEvalSource, parseSource, parseTrace } from '../src/index';
import { ISource } from '../src/types';

describe('parseSource', () =>
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

describe('parseTrace', () =>
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

function _checkPos(source: ISource)
{
	expect(String(source.line)).toMatch(/^\d+$/);
	expect(String(source.col)).toMatch(/^\d+$/);
}