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

		if (!body?.user?.id || !body?.user?.name) {
			throw createError({ status: 400, message: "Missing or invalid user data" });
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
