import type { WarnThreshold } from "#shared/utils/warn-thresholds";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "778";
const BASE = `/api/guilds/${GUILD}/warn-thresholds`;

let rows: WarnThreshold[] = [];
let readFails = false;
let removeAnswer: () => null = () => null;

registerEndpoint(BASE, {
	method: "GET",
	handler: () => {
		if (readFails) throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
		return rows;
	},
});

registerEndpoint(`${BASE}/3`, {
	method: "PUT",
	handler: () => ({ action: "Kick", count: 3, duration: null, period: 0 }),
});

registerEndpoint(`${BASE}/5`, {
	method: "DELETE",
	handler: () => removeAnswer(),
});

describe("useWarnThresholds", () => {
	beforeEach(() => {
		rows = [];
		readFails = false;
		removeAnswer = () => null;
		clearNuxtData();
	});

	it("keeps a saved threshold when the read after the write fails", async () => {
		const { setThreshold, thresholds, error } = useWarnThresholds(GUILD);
		await vi.waitFor(() => expect(thresholds.value).toEqual([]));

		readFails = true;
		const result = await setThreshold(3, { action: "Kick", duration: null, period: 0 });
		await flushPromises();

		expect(result.ok).toBe(true);
		await vi.waitFor(() =>
			expect(thresholds.value).toEqual([
				{ action: "Kick", count: 3, duration: null, period: 0 },
			]),
		);
		expect(error.value).toBeFalsy();
	});

	it("counts a threshold that was already gone as removed", async () => {
		rows = [{ action: "Kick", count: 5, duration: null, period: 0 }];
		const { removeThreshold, thresholds } = useWarnThresholds(GUILD);
		await vi.waitFor(() => expect(thresholds.value).toHaveLength(1));

		rows = [];
		removeAnswer = () => {
			throw createError({
				data: { code: "unknown" },
				statusCode: 404,
				statusMessage: "Warning threshold not set",
			});
		};

		expect(await removeThreshold(5)).toEqual({ ok: true, value: undefined });
		expect(thresholds.value).toEqual([]);
	});
});
