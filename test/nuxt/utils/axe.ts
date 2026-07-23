import type { VueWrapper } from "@vue/test-utils";
import type { AxeResults, RunOptions } from "axe-core";
import "axe-core";

// axe-core is a UMD module that exposes itself as window.axe in the browser
declare const axe: {
	run: (context: Element, options?: RunOptions) => Promise<AxeResults>;
};

/**
 * Shared axe-core options for isolated component audits.
 * Page-level and contrast rules are disabled because they require full-page
 * context (a single `main`, resolved theme variables) that isolated component
 * mounts don't provide; contrast is validated via full-page Lighthouse instead.
 */
const axeRunOptions: RunOptions = {
	resultTypes: ["violations"],
	rules: {
		"landmark-one-main": { enabled: false },
		"region": { enabled: false },
		"page-has-heading-one": { enabled: false },
		"landmark-no-duplicate-banner": { enabled: false },
		"landmark-no-duplicate-contentinfo": { enabled: false },
		"landmark-no-duplicate-main": { enabled: false },
		"color-contrast": { enabled: false },
	},
};

/**
 * Run an axe accessibility audit against a mounted component.
 * The element is cloned into a throwaway container appended to the document so
 * axe can traverse a stable subtree, which is removed once the audit resolves.
 *
 * Pass `include` for nodes outside the wrapper tree (e.g. Teleport targets).
 */
export async function runAxe(
	wrapper: VueWrapper,
	options?: { include?: Element[] },
): Promise<AxeResults> {
	const container = document.createElement("div");
	document.body.appendChild(container);
	container.appendChild(wrapper.element.cloneNode(true));
	for (const element of options?.include ?? []) {
		container.appendChild(element.cloneNode(true));
	}

	try {
		return await axe.run(container, axeRunOptions);
	} finally {
		container.remove();
	}
}
