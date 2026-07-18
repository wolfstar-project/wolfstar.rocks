import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";

describe("useFooter", () => {
	async function setup() {
		let composable: ReturnType<typeof useFooter> | undefined;

		const Child = defineComponent({
			setup() {
				composable = useFooter();
				return () => null;
			},
		});

		await mountSuspended(Child);
		return composable!;
	}

	it("should return an object with a columns computed property", async () => {
		const { columns } = await setup();
		expect(columns).toBeDefined();
		expect(columns.value).toBeInstanceOf(Array);
	});

	it("should have three columns", async () => {
		const { columns } = await setup();
		expect(columns.value).toHaveLength(3);
	});

	it("should have Product as the first column", async () => {
		const { columns } = await setup();
		expect(columns.value[0]!.label).toBe("Product");
	});

	it("should have Community as the second column", async () => {
		const { columns } = await setup();
		expect(columns.value[1]!.label).toBe("Community");
	});

	it("should have Legal as the third column", async () => {
		const { columns } = await setup();
		expect(columns.value[2]!.label).toBe("Legal");
	});

	it("should have 3 children in the Product column", async () => {
		const { columns } = await setup();
		expect(columns.value[0]!.children).toHaveLength(3);
	});

	it("should have 4 children in the Community column", async () => {
		const { columns } = await setup();
		expect(columns.value[1]!.children).toHaveLength(4);
	});

	it("should have 2 children in the Legal column", async () => {
		const { columns } = await setup();
		expect(columns.value[2]!.children).toHaveLength(2);
	});

	it("should include Support Server in Community", async () => {
		const { columns } = await setup();
		const labels = columns.value[1]!.children!.map((c) => c.label);
		expect(labels).toContain("Support Server");
	});

	it("should include Terms of Use in Legal", async () => {
		const { columns } = await setup();
		const labels = columns.value[2]!.children!.map((c) => c.label);
		expect(labels).toContain("Terms of Use");
	});

	it("should include Privacy Policy in Legal", async () => {
		const { columns } = await setup();
		const labels = columns.value[2]!.children!.map((c) => c.label);
		expect(labels).toContain("Privacy Policy");
	});
});
