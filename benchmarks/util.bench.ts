import { bench, describe } from 'vitest';
import { bitwiseHas, bitwiseSet, getAcronym, removeNonAlphaNumeric } from '../src/utils/util';

describe('getAcronym', () => {
	bench('short name', () => {
		getAcronym('My Server');
	});

	bench('long name with apostrophes', () => {
		getAcronym("John's Amazing Discord Server");
	});

	bench('single word', () => {
		getAcronym('WolfStar');
	});

	bench('many words', () => {
		getAcronym('The Quick Brown Fox Jumps Over The Lazy Dog');
	});
});

describe('removeNonAlphaNumeric', () => {
	bench('with special characters', () => {
		removeNonAlphaNumeric('Hello, World! @#$%^&*()');
	});

	bench('already clean string', () => {
		removeNonAlphaNumeric('HelloWorld123');
	});

	bench('empty string', () => {
		removeNonAlphaNumeric('');
	});
});

describe('bitwiseHas', () => {
	bench('check single bit set', () => {
		bitwiseHas(0b1010, 0b0010);
	});

	bench('check single bit not set', () => {
		bitwiseHas(0b1010, 0b0100);
	});

	bench('check multiple bits', () => {
		bitwiseHas(0b1111, 0b1010);
	});
});

describe('bitwiseSet', () => {
	bench('set bit on', () => {
		bitwiseSet(0b1000, 0b0010, true);
	});

	bench('set bit off', () => {
		bitwiseSet(0b1010, 0b0010, false);
	});
});
