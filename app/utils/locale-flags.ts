/** The flags in `public/flags/`, by the language or locale they stand for. */
const FLAGS = new Set([
	"cs",
	"da",
	"de",
	"el",
	"en-GB",
	"en-US",
	"es-419",
	"es-ES",
	"fi",
	"fr",
	"hi",
	"hr",
	"hu",
	"id",
	"it",
	"ja",
	"ko",
	"lt",
	"nl",
	"no",
	"pt-BR",
	"pt-PT",
	"ro",
	"ru",
	"tr",
	"uk",
]);

// Norwegian Bokmål is tagged by its own subtag, not the country's.
const LANGUAGE_ALIASES: Record<string, string> = { nb: "no" };

/**
 * The flag drawn beside a language: the locale's own when the language is
 * split by country (English, Spanish, Portuguese), else the language's.
 * Undefined when there is none, so the option goes without.
 */
export function localeFlagSrc(code: string): string | undefined {
	if (FLAGS.has(code)) return `/flags/${code}.svg`;
	const language = code.split("-")[0] ?? code;
	const flag = LANGUAGE_ALIASES[language] ?? language;
	return FLAGS.has(flag) ? `/flags/${flag}.svg` : undefined;
}
