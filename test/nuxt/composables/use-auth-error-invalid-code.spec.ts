import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";

describe("useAuthErrorMessage invalid_code", () => {
	it("localizes Better Auth callback failures", async () => {
		const component = await mountSuspended(
			defineComponent({
				setup() {
					const { localizeAuthError } = useAuthErrorMessage();
					return () => h("p", localizeAuthError("invalid_code"));
				},
			}),
		);

		expect(component.text()).toBe("Invalid callback request");
	});
});
