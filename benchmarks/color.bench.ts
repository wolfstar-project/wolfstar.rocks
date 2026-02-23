import { bench, describe } from 'vitest';
import { B10, HEX, HSL, RGB } from '../src/utils/structures/color';
import { hexConcat, luminance, parse } from '../src/utils/Color';

describe('Color parsing', () => {
	bench('parse HEX color (#ff8040)', () => {
		parse('#ff8040');
	});

	bench('parse RGB color', () => {
		parse('rgb(255, 128, 64)');
	});

	bench('parse HSL color', () => {
		parse('hsl(20, 100, 63)');
	});

	bench('parse B10 color', () => {
		parse('16744512');
	});

	bench('parse random color', () => {
		parse('random');
	});
});

describe('Color conversions', () => {
	bench('HEX to RGB', () => {
		new HEX('ff', '80', '40').Rgb;
	});

	bench('HEX to HSL', () => {
		new HEX('ff', '80', '40').Hsl;
	});

	bench('HEX to B10', () => {
		new HEX('ff', '80', '40').B10;
	});

	bench('RGB to HEX', () => {
		new RGB(255, 128, 64).Hex;
	});

	bench('RGB to HSL', () => {
		new RGB(255, 128, 64).Hsl;
	});

	bench('RGB to B10', () => {
		new RGB(255, 128, 64).B10;
	});

	bench('HSL to RGB', () => {
		new HSL(20, 100, 63).Rgb;
	});

	bench('HSL to HEX', () => {
		new HSL(20, 100, 63).Hex;
	});

	bench('B10 to HEX', () => {
		new B10(16744512).Hex;
	});

	bench('B10 to RGB', () => {
		new B10(16744512).Rgb;
	});
});

describe('Color utilities', () => {
	bench('luminance calculation', () => {
		luminance(255, 128, 64);
	});

	bench('hexConcat', () => {
		hexConcat(255, 128, 64);
	});
});
