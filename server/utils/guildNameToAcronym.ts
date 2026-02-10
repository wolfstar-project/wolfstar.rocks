/**
 * @param name Guild name
 * @returns Guild acronym
 */
export function guildNameToAcronym(name: string) {
	const MAX_LEN = 3;
	if (!name || !name.trim()) {
		return "";
	}

	const normalized = name
		.trim()
		.replace(/\s+/g, " ")
		.replace(/(?:'s|’s)\b/giu, " ");

	const words = [...normalized.matchAll(/(?:\p{L}|\p{N})[\p{L}\p{N}'’-]*/gu)].map((m) => m[0]);

	if (words.length === 1) {
		const only = words[0];
		const alnums = [...String(only)].filter((ch) => /[\p{L}\p{N}]/u.test(ch)).slice(0, MAX_LEN);
		if (alnums.length > 1 && /\p{N}/u.test(alnums[0]!)) {
			return alnums.join("").toUpperCase();
		}
	}

	const initials: string[] = [];
	for (const w of words) {
		const firstGrapheme = [...w][0];
		if (firstGrapheme && /[\p{L}\p{N}]/u.test(firstGrapheme)) {
			initials.push(firstGrapheme);
			if (initials.length >= MAX_LEN) {
				break;
			}
		}
	}

	if (initials.length === 0) {
		const fallback = [...normalized].filter((ch) => /[\p{L}\p{N}]/u.test(ch)).slice(0, MAX_LEN);
		if (fallback.length) {
			return fallback.join("").toUpperCase();
		}

		return [...normalized].slice(0, MAX_LEN).join("").toUpperCase();
	}

	return initials.join("").toUpperCase();
}
