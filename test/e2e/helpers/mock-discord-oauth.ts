import type { Page } from "@playwright/test";
import type { SessionUser } from "../../fixtures/discord-user";

export async function mockDiscordExchangeSuccess(page: Page, user: SessionUser): Promise<void> {
	// Stub the client-side token exchange call (useFetch in callback.vue has server:false)
	await page.route("**/api/auth/discord**", (route) =>
		route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
	);

	// Stub the session refresh so useAuth().user is populated
	await page.route("**/api/_auth/session**", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ user, loggedInAt: Date.now() }),
		}),
	);
}

export async function mockDiscordExchangeFail(page: Page): Promise<void> {
	await page.route("**/api/auth/discord**", (route) =>
		route.fulfill({
			status: 500,
			contentType: "application/json",
			body: JSON.stringify({
				message: "Failed to authenticate with Discord. Please try again.",
			}),
		}),
	);
}

export async function mockVerifyStateSuccess(page: Page, redirectUrl = "/"): Promise<void> {
	await page.route("**/api/auth/verify-state**", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ redirectUrl }),
		}),
	);
}

export async function mockVerifyStateFail(page: Page): Promise<void> {
	await page.route("**/api/auth/verify-state**", (route) =>
		route.fulfill({
			status: 400,
			contentType: "application/json",
			body: JSON.stringify({ message: "Invalid state parameter." }),
		}),
	);
}

export async function stubDiscordAuthorize(page: Page): Promise<void> {
	await page.route("https://discord.com/oauth2/authorize**", (route) =>
		route.fulfill({
			status: 200,
			contentType: "text/html",
			body: "<html><body><h1>Discord stub</h1></body></html>",
		}),
	);
}
