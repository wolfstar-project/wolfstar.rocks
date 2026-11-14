import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";

async function mountPhoneScreen(route = "/") {
	let screen: ReturnType<typeof usePhoneScreen> | undefined;
	await mountSuspended(
		defineComponent({
			setup() {
				screen = usePhoneScreen();
				return () => null;
			},
		}),
		{ route },
	);
	return screen!;
}

describe("usePhoneScreen", () => {
	afterEach(async () => {
		await useRouter().replace({ query: {} });
	});

	it("starts on the list", async () => {
		const { screen } = await mountPhoneScreen();

		expect(screen.value).toBe("list");
	});

	it("opens the page in a new history entry, keeping the rest of the query", async () => {
		const router = useRouter();
		const { openPage, screen } = await mountPhoneScreen("/?tab=discord");

		await openPage();
		await nextTick();

		expect(screen.value).toBe("page");
		expect(router.currentRoute.value.query).toStrictEqual({ screen: "page", tab: "discord" });
	});

	it("goes back to the list", async () => {
		const router = useRouter();
		const { openList, openPage, screen } = await mountPhoneScreen();

		await openPage();
		await openList();
		await nextTick();

		expect(screen.value).toBe("list");
		expect(router.currentRoute.value.query.screen).toBeUndefined();
	});

	it("reads a page that the URL already opens, as after a reload", async () => {
		const { screen } = await mountPhoneScreen("/?screen=page");

		expect(screen.value).toBe("page");
	});
});
