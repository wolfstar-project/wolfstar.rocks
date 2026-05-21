import type { Page } from "@playwright/test";
import type { SessionUser } from "../../fixtures/discord-user";

export async function seedSession(page: Page, user: SessionUser): Promise<void> {
	// page.request uses the browser context's baseURL set by createPage()
	const response = await page.request.post("/api/__test__/seed-session", {
		data: { user },
	});

	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`seedSession failed with status ${response.status()}: ${body}`);
	}
}
