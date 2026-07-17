import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";

describe("useAuthIdentity", () => {
	it("should mount without errors", async () => {
		const TestComponent = defineComponent({
			setup() {
				useAuthIdentity();
				return () => null;
			},
		});

		await expect(mountSuspended(TestComponent)).resolves.toBeDefined();
	});
});
