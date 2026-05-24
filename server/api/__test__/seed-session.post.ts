import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";

interface SeedSessionBody {
	user: {
		id: string;
		name: string;
		globalName: string | null;
		username: string;
		avatar: string | null;
	};
}

export default defineWrappedResponseHandler(
	async (event) => {
		if (process.env.NODE_ENV !== "test") {
			throw createError({ status: 404, message: "Not Found" });
		}

		const body = await readBody<SeedSessionBody>(event);

		// Validate all required user fields
		if (!body?.user) {
			throw createError({ status: 400, message: "Missing user object" });
		}

		const { id, name, username, globalName, avatar } = body.user;

		// Validate id field
		if (!id || typeof id !== "string" || id.trim() === "") {
			throw createError({ status: 400, message: "Missing or invalid user id" });
		}

		// Validate name field
		if (!name || typeof name !== "string" || name.trim() === "") {
			throw createError({ status: 400, message: "Missing or invalid user name" });
		}

		// Validate username field
		if (!username || typeof username !== "string" || username.trim() === "") {
			throw createError({ status: 400, message: "Missing or invalid user username" });
		}

		// Validate globalName field (can be null, but if present must be string)
		if (globalName !== null && (typeof globalName !== "string" || globalName.trim() === "")) {
			throw createError({ status: 400, message: "Invalid user globalName" });
		}

		// Validate avatar field (can be null, but if present must be string)
		if (avatar !== null && (typeof avatar !== "string" || avatar.trim() === "")) {
			throw createError({ status: 400, message: "Invalid user avatar" });
		}

		const tokens: RESTPostOAuth2AccessTokenResult = {
			access_token: "test-access-token",
			token_type: "Bearer",
			expires_in: 604800,
			refresh_token: "test-refresh-token",
			scope: "identify guilds.members.read",
		};

		await setUserSession(event, {
			loggedInAt: Date.now(),
			secure: { tokens },
			user: body.user,
		});

		return { ok: true };
	},
	{ auth: false },
);
