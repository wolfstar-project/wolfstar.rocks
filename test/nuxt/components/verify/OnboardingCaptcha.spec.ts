import { mockComponent, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import OnboardingCaptcha from "~/components/verify/OnboardingCaptcha.vue";

const GUILD_ID = "254360814063058944";

// A captcha the member solves at once: Cloudflare's script is not loaded.
// `mockComponent` is hoisted above the imports, so the factory imports Vue itself.
mockComponent("VerifyTurnstile", async () => {
	const { defineComponent, h, onMounted } = await import("vue");
	return defineComponent({
		// The listener comes through as an attribute of the stand-in.
		inheritAttrs: false,
		setup: (_props, { attrs, expose }) => {
			expose({ reset: () => undefined });
			onMounted(() =>
				(attrs.onToken as ((token: string) => void) | undefined)?.("turnstile-token"),
			);
			return () => h("div");
		},
	});
});

let bodies: unknown[] = [];
let refusal: { status: number; code: string } | null = null;
let botError: string | null = null;

// h3's `readBody` needs Node's `Buffer`: the body is read off the web request.
registerEndpoint(`/api/verify/${GUILD_ID}/onboarding`, {
	method: "POST",
	handler: async (event) => {
		bodies.push(await event.req.json());
		if (refusal) {
			throw createError({ data: { code: refusal.code }, statusCode: refusal.status });
		}
		return { id: "12" };
	},
});
registerEndpoint(`/api/verify/${GUILD_ID}/onboarding/requests/12`, {
	method: "GET",
	handler: () => ({
		error: botError === null ? null : { code: botError, detail: "" },
		id: "12",
		processed: true,
	}),
});

const prompt = {
	expiresAt: "2026-11-27T12:10:00.000Z",
	siteKey: "site-key",
	stageName: "Human check",
	verificationId: "40",
};

async function mountCaptcha() {
	const wrapper = await mountSuspended(OnboardingCaptcha, {
		props: { guildId: GUILD_ID, guildName: "WolfStar HQ", prompt },
	});
	await nextTick();
	return wrapper;
}

async function verify(wrapper: Awaited<ReturnType<typeof mountCaptcha>>) {
	await wrapper
		.findAll("button")
		.find((button) => button.text() === "Verify")!
		.trigger("click");
}

describe("VerifyOnboardingCaptcha", () => {
	beforeEach(() => {
		bodies = [];
		refusal = null;
		botError = null;
	});

	it("sends the solved captcha for the stage, and says the member passed", async () => {
		const wrapper = await mountCaptcha();

		expect(wrapper.find("h2").text()).toBe("Pass the stage Human check");
		await verify(wrapper);

		await vi.waitFor(() => expect(wrapper.text()).toContain("You passed Human check"), {
			timeout: 4000,
		});
		expect(bodies).toStrictEqual([{ turnstileToken: "turnstile-token", verificationId: "40" }]);
	});

	it("says why WolfStar could not pass the member", async () => {
		botError = "expired";
		const wrapper = await mountCaptcha();

		await verify(wrapper);

		await vi.waitFor(
			() =>
				expect(wrapper.find('[role="alert"]').text()).toBe(
					"Your time for this stage ran out.",
				),
			{ timeout: 4000 },
		);
	});

	it("words a refusal of the page by its code", async () => {
		refusal = { code: "notWaiting", status: 409 };
		const wrapper = await mountCaptcha();

		await verify(wrapper);

		await vi.waitFor(() =>
			expect(wrapper.find('[role="alert"]').text()).toContain(
				"You no longer wait at this stage.",
			),
		);
	});
});
