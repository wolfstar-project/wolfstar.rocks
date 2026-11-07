import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import Twemoji from "~/components/Twemoji.vue";

async function mountFailed(props: { emoji: string; alt?: string }) {
	const wrapper = await mountSuspended(Twemoji, { props });
	await wrapper.get("img").trigger("error");
	return wrapper;
}

describe("Twemoji", () => {
	it("is read as the character when it has no text of its own", async () => {
		const wrapper = await mountSuspended(Twemoji, { props: { emoji: "😀" } });

		expect(wrapper.get("img").attributes("alt")).toBe("😀");
	});

	it("keeps its name when the image cannot load", async () => {
		const wrapper = await mountFailed({ emoji: "😀" });

		const glyph = wrapper.get(".twemoji-glyph");
		expect(glyph.attributes("role")).toBe("img");
		expect(glyph.attributes("aria-label")).toBe("😀");
	});

	it("uses the text it is given, and hides itself when that is empty", async () => {
		const named = await mountFailed({ emoji: "😀", alt: "grinning face" });
		expect(named.get(".twemoji-glyph").attributes("aria-label")).toBe("grinning face");

		const hidden = await mountFailed({ emoji: "😀", alt: "" });
		expect(hidden.get(".twemoji-glyph").attributes("aria-hidden")).toBe("true");
		expect(hidden.get(".twemoji-glyph").attributes("role")).toBeUndefined();
	});
});
