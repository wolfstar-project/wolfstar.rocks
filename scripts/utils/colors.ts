export const COLORS = {
	reset: "\x1B[0m",
	red: "\x1B[31m",
	green: "\x1B[32m",
	yellow: "\x1B[33m",
	magenta: "\x1B[35m",
	cyan: "\x1B[36m",
} as const;

export const colors = {
	red: (text: string) => `\x1B[31m${text}\x1B[0m`,
	green: (text: string) => `\x1B[32m${text}\x1B[0m`,
	yellow: (text: string) => `\x1B[33m${text}\x1B[0m`,
	cyan: (text: string) => `\x1B[36m${text}\x1B[0m`,
	dim: (text: string) => `\x1B[2m${text}\x1B[0m`,
	bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
};
