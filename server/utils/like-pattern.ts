/**
 * Builds the `ILIKE` pattern for a free-text "contains" filter.
 *
 * `%` and `_` are wildcards in a LIKE pattern and `\` escapes them, so a search
 * term carrying any of the three has to be escaped before the surrounding `%`
 * are added — otherwise `q=_` matches every row with at least one character
 * rather than the rows containing an underscore.
 */
export function containsPattern(value: string): string {
	return `%${value.replaceAll(/[\\%_]/gu, String.raw`\$&`)}%`;
}
