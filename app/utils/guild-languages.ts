import { localeFlagSrc } from "~/utils/locale-flags";

/** The names of the languages the bot speaks: the one its speakers use, then English. */
const GUILD_LANGUAGE_NAMES: Record<string, [string] | [string, string]> = {
	"ckb-IR": ["Kurdîya Navîn (Iran)", "Kurdish"],
	"de-DE": ["Deutsch", "German"],
	"en-GB": ["British English", "English, United Kingdom"],
	"en-US": ["American English", "English, United States"],
	"es-ES": ["Español", "Spanish"],
	"fa-IR": ["فارسی", "Persian"],
	"fr-FR": ["Français", "French"],
	"hi-IN": ["हिंदी", "Hindi"],
	"hi-Latn-IN": ["Hinglish", "Hindi (Latin Alphabet)"],
	"it-IT": ["Italiano", "Italian"],
	"ja-JP": ["日本語", "Japanese"],
	"nb-NO": ["Bokmål", "Norwegian Bokmål"],
	"nl-NL": ["Nederlands", "Dutch"],
	"pt-BR": ["Português Brasileiro", "Portuguese, Brazilian"],
	"ro-RO": ["Română", "Romanian"],
	"ru-RU": ["Русский", "Russian"],
	"sl-SI": ["Slovenščina", "Slovenian"],
	"tr-TR": ["Türkçe", "Turkish"],
};

export function mapLanguageKeysToNames(langKey: string): [string] | [string, string] {
	return GUILD_LANGUAGE_NAMES[langKey] ?? [langKey];
}

/** What a language select shows for each tag the bot stores. */
export function guildLanguageOptions(languages: readonly string[]) {
	return languages.map((langKey) => {
		const [nativeName, englishName] = mapLanguageKeysToNames(langKey);

		return {
			flag: localeFlagSrc(langKey),
			label: englishName ?? nativeName,
			// The name speakers use, then the tag the bot stores.
			note: `${nativeName} · ${langKey}`,
			value: langKey,
		};
	});
}
