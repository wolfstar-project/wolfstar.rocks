import { readJoinGuardVerifyGuildParam, parseJoinGuardInput } from "#server/utils/join-guard/route";
import {
	submitJoinGuardVerification,
	throwJoinGuardVerifyError,
} from "#server/utils/join-guard/verify";
import { JoinGuardVerifyBodySchema } from "#shared/schemas/join-guard";
import { useLogger } from "evlog";

/**
 * `POST /api/verify/:guild` (signed in): lets the member who waits at the
 * checkpoint pass, with `{ turnstileToken? }` (a `JoinGuardVerifyBody`).
 * Answers 202 `{ id }` of the `Pass` request; see
 * `GET /api/verify/:guild/requests/:request` for how it went. Refusals, with
 * `{ code }`: 409 `unavailable` or `notWaiting`; 403 `sharedBan`, `captcha`,
 * or `trust` (with `level` and `missing`, the `JoinGuardTrustGap`s); 503
 * `captchaUnavailable` when the guild asks for a captcha the site cannot
 * check (no Turnstile secret, or Cloudflare unreachable).
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = readJoinGuardVerifyGuildParam(event);
		const body = parseJoinGuardInput(JoinGuardVerifyBodySchema, (await readBody(event)) ?? {});

		const { requestId, trust } = await submitJoinGuardVerification(event, guildId, body).catch(
			throwJoinGuardVerifyError,
		);

		useLogger(event).set({ joinGuard: { guildId, requestId, trust: trust.level } });
		setResponseStatus(event, 202);
		return { id: requestId };
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		// A member passes once; a few tries cover a captcha that expired. The
		// route's own window, so the page's polling does not spend it.
		rateLimit: { enabled: true, limit: 5, window: minutes(1), scope: "route" },
	},
);
