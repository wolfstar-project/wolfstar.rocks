import type { ConsoleMessage, Page, Route } from "@playwright/test";
import { createRequire } from "node:module";
import { test as base, expect } from "@nuxt/test-utils/playwright";

const require = createRequire(import.meta.url);
const mockRoutes = require("../fixtures/mock-routes.cjs");

/**
 * Fail the test with a clear error message when an external API request isn't mocked.
 */
function failUnmockedRequest(route: Route, apiName: string): never {
	const url = route.request().url();
	const error = new Error(
		`\n` +
			`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
			`UNMOCKED EXTERNAL API REQUEST DETECTED\n` +
			`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
			`\n` +
			`API:  ${apiName}\n` +
			`URL:  ${url}\n` +
			`\n` +
			`This request would hit a real external API, which is not allowed in tests.\n` +
			`\n` +
			`To fix this, either:\n` +
			`  1. Add a fixture file for this request in test/fixtures/\n` +
			`  2. Add handling for this URL pattern in test/fixtures/mock-routes.cjs\n` +
			`\n` +
			`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
	);
	throw error;
}

/**
 * Playwright can dispose in-flight routes during navigation/teardown while an
 * async handler is still running. Fulfilling that route then throws
 * "Route is already handled!" — a benign race (request already aborted).
 */
function isRouteAlreadyHandledError(error: unknown): boolean {
	return error instanceof Error && error.message.includes("Route is already handled");
}

async function fulfillRouteSafely(
	route: Route,
	response: { status: number; contentType: string; body: string },
): Promise<void> {
	try {
		await route.fulfill({
			status: response.status,
			contentType: response.contentType,
			body: response.body,
		});
	} catch (error) {
		if (isRouteAlreadyHandledError(error)) {
			return;
		}
		throw error;
	}
}

async function setupRouteMocking(page: Page): Promise<void> {
	for (const routeDef of mockRoutes.routes) {
		await page.route(routeDef.pattern, async (route: Route) => {
			const url = route.request().url();
			const result = mockRoutes.matchRoute(url);

			if (result) {
				await fulfillRouteSafely(route, result.response);
			} else {
				failUnmockedRequest(route, routeDef.name);
			}
		});
	}
}

/**
 * Patterns that indicate a Vue hydration mismatch in console output.
 *
 * Vue always emits `console.error("Hydration completed but contains mismatches.")`
 * in production builds when a hydration mismatch occurs.
 *
 * When `debug.hydration: true` is enabled (sets `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`),
 * Vue also emits more detailed warnings (text content mismatch, node mismatch, etc.).
 * We catch both the summary error and the detailed warnings.
 */
const HYDRATION_MISMATCH_PATTERNS = [
	"Hydration completed but contains mismatches",
	"Hydration text content mismatch",
	"Hydration node mismatch",
	"Hydration children mismatch",
	"Hydration attribute mismatch",
	"Hydration class mismatch",
	"Hydration style mismatch",
];

function isHydrationMismatch(message: ConsoleMessage): boolean {
	const text = message.text();
	return HYDRATION_MISMATCH_PATTERNS.some((pattern) => text.includes(pattern));
}

/**
 * Extended test fixture with automatic external API mocking and hydration mismatch detection.
 *
 * All external API requests are intercepted and served from fixtures.
 * If a request cannot be mocked, the test will fail with a clear error.
 *
 * Hydration mismatches are detected via Vue's console.error output, which is always
 * emitted in production builds when server-rendered HTML doesn't match client expectations.
 */
export const test = base.extend<{ mockExternalApis: void; hydrationErrors: string[] }>({
	mockExternalApis: [
		async ({ page }, use) => {
			await setupRouteMocking(page);
			await use();
		},
		{ auto: true },
	],

	hydrationErrors: async ({ page }, use) => {
		const errors: string[] = [];

		page.on("console", (message) => {
			if (isHydrationMismatch(message)) {
				errors.push(message.text());
			}
		});

		await use(errors);
	},
});

export { expect };
