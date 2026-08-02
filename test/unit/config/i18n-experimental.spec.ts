import { describe, expect, it } from "vitest";
import { i18nExperimental } from "../../../config/i18n";

describe("i18nExperimental", () => {
	it("disables nitroContextDetection to avoid render:before crashes on static assets", () => {
		// WOLFSTAR-ROCKS-4K: @nuxtjs/i18n's render:before calls useI18nContext()
		// before the request hook initializes context for non-page render paths.
		expect(i18nExperimental.nitroContextDetection).toBe(false);
	});
});
