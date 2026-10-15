import { afterEach, describe, expect, it } from "vitest";
import { AUTH_HINT_SCRIPT, AUTH_HINT_STORAGE_KEY, writeAuthHint } from "~/utils/auth-hint";

const root = document.documentElement;

function runHintScript() {
	// The same text the page puts in <head>, run as the browser would.
	// eslint-disable-next-line no-new-func -- the script is a fixed string of ours
	new Function(AUTH_HINT_SCRIPT)();
}

describe("auth hint", () => {
	afterEach(() => {
		localStorage.removeItem(AUTH_HINT_STORAGE_KEY);
		root.removeAttribute("data-auth");
		root.style.removeProperty("--auth-name");
	});

	it("marks the page signed in, with the name, from what was stored", () => {
		writeAuthHint("RedStar");
		root.removeAttribute("data-auth");
		root.style.removeProperty("--auth-name");

		runHintScript();

		expect(root.dataset.auth).toBe("user");
		expect(root.style.getPropertyValue("--auth-name")).toBe('"RedStar"');
	});

	it("leaves the page signed out when nothing, or something broken, is stored", () => {
		runHintScript();
		expect(root.hasAttribute("data-auth")).toBe(false);

		localStorage.setItem(AUTH_HINT_STORAGE_KEY, "{broken");
		expect(() => runHintScript()).not.toThrow();
		expect(root.hasAttribute("data-auth")).toBe(false);
	});

	it("forgets the account on sign-out", () => {
		writeAuthHint("RedStar");
		writeAuthHint(null);

		expect(localStorage.getItem(AUTH_HINT_STORAGE_KEY)).toBeNull();
		expect(root.hasAttribute("data-auth")).toBe(false);
		expect(root.style.getPropertyValue("--auth-name")).toBe("");
	});
});
