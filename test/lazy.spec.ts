import { basename } from 'path';
import { parseSource } from '../src/index';

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

			expect(actual.line).toMatch(/^\d+$/);
			expect(actual.col).toMatch(/^\d+$/);

			expect(actual).toMatchSnapshot();
		});
	})



})