import { boolean, object } from "valibot";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { rawMock } = vi.hoisted(() => ({ rawMock: vi.fn() }));

vi.mock("ofetch", () => ({ $fetch: { raw: rawMock } }));

vi.mock("#server/utils/sentry/metrics", () => ({
	instrumentServiceCall: (_service: string, _endpoint: string, run: () => unknown) => run(),
}));

import { callExternalService } from "#server/utils/external-service";

const service = { name: "staryl", secret: "a-shared-secret", url: "https://staryl.test" };
const request = {
	actorId: "266624760782258186",
	endpoint: "notifications.read",
	path: "/guilds/1/notifications",
	schema: object({ enabled: boolean() }),
};

function answer(status: number, body: unknown) {
	rawMock.mockResolvedValue({ _data: body, status });
}

describe("callExternalService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sends the secret as a bearer token and names the member it acts for", async () => {
		answer(200, { enabled: true });

		const result = await callExternalService(service, {
			...request,
			body: { enabled: true },
			method: "PATCH",
		});

		expect(result).toStrictEqual({ ok: true, value: { enabled: true } });
		expect(rawMock).toHaveBeenCalledWith(
			"https://staryl.test/guilds/1/notifications",
			expect.objectContaining({
				body: { enabled: true },
				headers: {
					"Authorization": "Bearer a-shared-secret",
					"x-actor-id": "266624760782258186",
				},
				method: "PATCH",
			}),
		);
	});

	it.each([
		["no URL", { ...service, url: "" }],
		["no secret", { ...service, secret: "" }],
	])("makes no call for a service with %s", async (_name, unset) => {
		const result = await callExternalService(unset, request);

		expect(result).toStrictEqual({ error: { kind: "not-configured" }, ok: false });
		expect(rawMock).not.toHaveBeenCalled();
	});

	it("hands back the code of a refusal, for the route to answer with", async () => {
		answer(409, { error: "duplicate" });

		const result = await callExternalService(service, request);

		expect(result).toStrictEqual({
			error: { code: "duplicate", kind: "refused", status: 409 },
			ok: false,
		});
	});

	it("reads a refusal without a code as an unknown one", async () => {
		answer(422, "Unprocessable Entity");

		const result = await callExternalService(service, request);

		expect(result).toMatchObject({ error: { code: "unknown", kind: "refused" } });
	});

	it.each([[500], [503], [401]])(
		"reads a %i as the service being out of reach, not as a refusal",
		async (status) => {
			answer(status, { error: "unauthorized" });

			const result = await callExternalService(service, request);

			expect(result).toStrictEqual({ error: { kind: "unreachable", status }, ok: false });
		},
	);

	it("reads a call that got no answer as the service being out of reach", async () => {
		rawMock.mockRejectedValue(new Error("fetch failed"));

		const result = await callExternalService(service, request);

		expect(result).toStrictEqual({ error: { kind: "unreachable", status: null }, ok: false });
	});

	it("refuses an answer of another shape than the schema", async () => {
		answer(200, { enabled: "yes" });

		const result = await callExternalService(service, request);

		expect(result).toMatchObject({ error: { kind: "invalid-answer" }, ok: false });
	});
});
