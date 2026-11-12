import { ConsentManager } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mounted: { unmount: () => void }[] = [];

function cookieValue(name: string): string | undefined {
	const entry = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
	return entry === undefined ? undefined : decodeURIComponent(entry.slice(name.length + 1));
}

async function mountManager() {
	const wrapper = await mountSuspended(ConsentManager, { attachTo: document.body });
	mounted.push(wrapper);
	return wrapper;
}

function button(label: string) {
	const found = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(element) => element.textContent?.trim() === label,
	);
	if (!found) throw new Error(`No button named "${label}"`);
	return found;
}

describe("ConsentManager", () => {
	beforeEach(() => {
		const state = useCookieControl();
		state.isConsentGiven.value = undefined;
		state.cookiesEnabled.value = undefined;
		state.cookiesEnabledIds.value = undefined;
		state.isModalActive.value = false;
		for (const name of ["ncc_c", "ncc_e"]) {
			document.cookie = `${name}=; path=/; max-age=0`;
		}
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("asks until a choice is made", async () => {
		const wrapper = await mountManager();
		expect(wrapper.text()).toContain("Cookies on WolfStar.rocks");
		expect(wrapper.find('a[href="/privacy"]').exists()).toBe(true);
	});

	it("keeps session replay off with necessary cookies only", async () => {
		const wrapper = await mountManager();
		button("Use necessary cookies only").click();

		await vi.waitFor(() => expect(cookieValue("ncc_c")).toBe("svcr"));
		expect(cookieValue("ncc_e")?.split("~")).toEqual(["s", "v", "c"]);
		expect(wrapper.find("section").exists()).toBe(false);
	});

	it("turns session replay on with every cookie", async () => {
		await mountManager();
		button("Accept all cookies").click();

		await vi.waitFor(() => expect(cookieValue("ncc_e")?.split("~")).toContain("r"));
		expect(useCookieConsent().isEnabled("r")).toBe(true);
	});

	it("saves only what was switched on in the settings dialog", async () => {
		await mountManager();
		button("Choose cookies").click();

		const replay = await vi.waitFor(() => {
			const element = document.querySelector<HTMLButtonElement>(
				'[role="dialog"] [role="switch"]',
			);
			if (!element) throw new Error("dialog not open");
			return element;
		});
		expect(replay.getAttribute("aria-checked")).toBe("false");
		replay.click();
		await vi.waitFor(() => expect(replay.getAttribute("aria-checked")).toBe("true"));
		button("Save cookie choices").click();

		await vi.waitFor(() => expect(cookieValue("ncc_e")?.split("~")).toContain("r"));
		expect(useCookieControl().isModalActive.value).toBe(false);
	});
});
