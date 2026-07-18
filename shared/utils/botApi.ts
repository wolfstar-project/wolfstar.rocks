import type {
	BotApiAuthPayload,
	BotApiAuthSessionInput,
	BotApiCommand,
} from "#shared/types/botApi";
import type { WolfCommand } from "#shared/types/discord";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const DEFAULT_BOT_API_AUTH_COOKIE = "SAPPHIRE_AUTH";

export function getBotApiAuthCookieName(): string {
	return process.env.NUXT_BOT_API_AUTH_COOKIE || DEFAULT_BOT_API_AUTH_COOKIE;
}

/**
 * Resolve the aes-256-cbc secret shared with sapphire-plugin-api.
 * Prefers `NUXT_BOT_API_OAUTH_SECRET`, then an optional Discord client-secret fallback.
 */
export function getBotApiOauthSecret(discordClientSecretFallback = ""): string {
	return process.env.NUXT_BOT_API_OAUTH_SECRET || discordClientSecretFallback || "";
}

/**
 * Encrypt a sapphire-plugin-api auth payload (aes-256-cbc), matching
 * `@sapphire/plugin-api` Auth.encrypt so api.wolfstar.rocks accepts the cookie.
 */
export function encryptBotApiAuth(data: BotApiAuthPayload, secret: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-cbc", secret, iv);
	return `${cipher.update(JSON.stringify(data), "utf8", "base64") + cipher.final("base64")}.${iv.toString("base64")}`;
}

/**
 * Decrypt a sapphire-plugin-api auth token. Returns null when expired or invalid.
 */
export function decryptBotApiAuth(token: string, secret: string): BotApiAuthPayload | null {
	const [data, iv] = token.split(".");
	if (!data || !iv) {
		return null;
	}
	try {
		const decipher = createDecipheriv("aes-256-cbc", secret, Buffer.from(iv, "base64"));
		const parsed = JSON.parse(
			decipher.update(data, "base64", "utf8") + decipher.final("utf8"),
		) as BotApiAuthPayload;
		return parsed.expires >= Date.now() ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * Build outbound Cookie headers for sapphire-plugin-api when session credentials exist.
 * Returns an empty object when the user/token/secret is missing.
 */
export function getOptionalBotApiAuthHeaders(
	input: BotApiAuthSessionInput,
): Record<string, string> {
	const { accessToken, secret, userId } = input;
	if (!userId || !accessToken || !secret) {
		return {};
	}

	const cookieValue = encryptBotApiAuth(
		{
			expires: Date.now() + (input.expiresInMs ?? 60 * 60 * 1000),
			id: userId,
			refresh: "",
			token: accessToken,
		},
		secret,
	);

	return {
		Cookie: `${input.cookieName ?? getBotApiAuthCookieName()}=${cookieValue}`,
	};
}

/**
 * Normalize a bot API command into the dashboard's WolfCommand shape
 * (`aliases` + non-null `subCategory`).
 */
export function normalizeBotApiCommand(
	command: BotApiCommand & { aliases?: string[] },
): WolfCommand {
	return {
		aliases: command.alias ?? command.aliases ?? [],
		category: command.category,
		description: command.description,
		extendedHelp: command.extendedHelp,
		guarded: command.guarded,
		name: command.name,
		permissionLevel: command.permissionLevel,
		preconditions: command.preconditions,
		subCategory: command.subCategory ?? "",
	};
}

export function normalizeBotApiCommands(
	commands: Array<BotApiCommand & { aliases?: string[] }>,
): WolfCommand[] {
	return commands.map(normalizeBotApiCommand);
}
