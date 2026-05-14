export function normalizeGuildIdQuery(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	const normalizedGuildId = value.trim();

	if (
		normalizedGuildId.length === 0 ||
		normalizedGuildId === "null" ||
		normalizedGuildId === "undefined"
	) {
		return undefined;
	}

	return normalizedGuildId;
}
