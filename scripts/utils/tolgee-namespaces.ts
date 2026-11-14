export interface PullNamespacePlan {
	/** Namespaces to remap into `i18n/locales/`. */
	active: string[];
	/** Declared-unpushed namespaces absent from every pulled language. */
	skipped: string[];
	/** `{tag}/{namespace}.json` files an active namespace is missing. */
	missing: string[];
}

interface PullNamespaceInput {
	namespaces: readonly string[];
	/** Namespaces deliberately not pushed to Tolgee yet. */
	unpushedNamespaces: readonly string[];
	tags: readonly string[];
	hasPulledFile: (tag: string, namespace: string) => boolean;
}

/**
 * Decide which namespaces a pull may remap. Only a namespace declared in
 * `unpushedNamespaces` and absent from every pulled language is skipped; any
 * other absence is reported as missing so an incomplete export still fails.
 */
export function planPullNamespaces({
	namespaces,
	unpushedNamespaces,
	tags,
	hasPulledFile,
}: PullNamespaceInput): PullNamespacePlan {
	const skipped = namespaces.filter(
		(ns) => unpushedNamespaces.includes(ns) && !tags.some((tag) => hasPulledFile(tag, ns)),
	);
	const active = namespaces.filter((ns) => !skipped.includes(ns));
	const missing = tags.flatMap((tag) =>
		active.filter((ns) => !hasPulledFile(tag, ns)).map((ns) => `${tag}/${ns}.json`),
	);
	return { active, skipped, missing };
}
