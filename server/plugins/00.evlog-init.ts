import { auditRedactPreset, initLogger } from "evlog";

export default defineNitroPlugin(() => {
	initLogger({
		redact: {
			paths: [
				...(auditRedactPreset.paths ?? []),
				"user.email",
				"user.password",
				"user.accessToken",
				"user.refreshToken",
				"discord.botToken",
				"headers.authorization",
				"headers.cookie",
			],
		},
	});
});
