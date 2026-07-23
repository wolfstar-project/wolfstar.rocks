export const MARKETING_PATHS = [
	"/",
	"/wolfstar",
	"/staryl",
	"/privacy",
	"/terms",
	"/commands",
	"/profile",
	"/account",
	"/blog",
	"/changelog",
] as const;

export function isMarketingPath(path: string): boolean {
	return MARKETING_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}
