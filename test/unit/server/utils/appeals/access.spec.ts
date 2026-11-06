import { isAppealReviewer, type AppealReviewerInput } from "#server/utils/appeals/access";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { describe, expect, it } from "vitest";

const OWNER = "100000000000000001";
const MEMBER = "100000000000000002";
const MANAGER_ROLE = "200000000000000001";
const MOD_ROLE = "200000000000000002";
const ADMIN_ROLE = "200000000000000003";
const OTHER_ROLE = "200000000000000004";

function input(overrides: Partial<AppealReviewerInput> = {}): AppealReviewerInput {
	return {
		userId: MEMBER,
		ownerId: OWNER,
		roleIds: [],
		permissions: 0n,
		settings: { appealsManagerRoles: [], rolesModerator: [], rolesAdmin: [] },
		...overrides,
	};
}

describe("isAppealReviewer", () => {
	it("lets the owner review, whatever they hold", () => {
		expect(isAppealReviewer(input({ userId: OWNER }))).toBe(true);
	});

	it("turns away a member who holds nothing", () => {
		expect(isAppealReviewer(input())).toBe(false);
		expect(isAppealReviewer(input({ ownerId: null }))).toBe(false);
	});

	it("takes a role of the manager roles besides the moderators", () => {
		const settings = {
			appealsManagerRoles: [MANAGER_ROLE],
			rolesModerator: [MOD_ROLE],
			rolesAdmin: [],
		};

		expect(isAppealReviewer(input({ roleIds: [MANAGER_ROLE], settings }))).toBe(true);
		expect(isAppealReviewer(input({ roleIds: [OTHER_ROLE], settings }))).toBe(false);
	});

	describe("a moderator", () => {
		it("is who holds Ban Members while the server has no moderator role", () => {
			expect(isAppealReviewer(input({ permissions: PermissionFlagsBits.BanMembers }))).toBe(
				true,
			);
		});

		it("is who holds a moderator role when the server has some", () => {
			const settings = {
				appealsManagerRoles: [],
				rolesModerator: [MOD_ROLE],
				rolesAdmin: [ADMIN_ROLE],
			};

			expect(isAppealReviewer(input({ roleIds: [MOD_ROLE], settings }))).toBe(true);
		});

		it("is not who holds Ban Members but none of the roles the server named", () => {
			const settings = {
				appealsManagerRoles: [],
				rolesModerator: [MOD_ROLE],
				rolesAdmin: [ADMIN_ROLE],
			};

			expect(
				isAppealReviewer(
					input({
						roleIds: [OTHER_ROLE],
						permissions:
							PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageGuild,
						settings,
					}),
				),
			).toBe(false);
		});
	});

	describe("an administrator", () => {
		it("is who holds Manage Server while the server has no administrator role", () => {
			expect(isAppealReviewer(input({ permissions: PermissionFlagsBits.ManageGuild }))).toBe(
				true,
			);
		});

		it("is who holds an administrator role when the server has some", () => {
			const settings = {
				appealsManagerRoles: [],
				rolesModerator: [MOD_ROLE],
				rolesAdmin: [ADMIN_ROLE],
			};

			expect(isAppealReviewer(input({ roleIds: [ADMIN_ROLE], settings }))).toBe(true);
		});

		it("is not who holds Manage Server but not the role the server named", () => {
			const settings = {
				appealsManagerRoles: [],
				rolesModerator: [MOD_ROLE],
				rolesAdmin: [ADMIN_ROLE],
			};

			expect(
				isAppealReviewer(
					input({
						roleIds: [OTHER_ROLE],
						permissions: PermissionFlagsBits.ManageGuild,
						settings,
					}),
				),
			).toBe(false);
		});
	});

	it("counts the Administrator permission as every permission", () => {
		expect(isAppealReviewer(input({ permissions: PermissionFlagsBits.Administrator }))).toBe(
			true,
		);
	});

	it("does not count a permission nothing asks for", () => {
		expect(isAppealReviewer(input({ permissions: PermissionFlagsBits.KickMembers }))).toBe(
			false,
		);
	});
});
