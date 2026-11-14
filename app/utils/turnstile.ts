/** The part of Cloudflare Turnstile's browser API the verification page uses. */
export interface TurnstileApi {
	render: (
		container: HTMLElement,
		options: {
			"sitekey": string;
			"theme"?: "light" | "dark" | "auto";
			"language"?: string;
			"callback"?: (token: string) => void;
			"error-callback"?: () => void;
			"expired-callback"?: () => void;
		},
	) => string;
	reset: (widgetId: string) => void;
	remove: (widgetId: string) => void;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

/** Turnstile's script, in explicit mode: it draws nothing until asked to. */
const TURNSTILE_SCRIPT_URL =
	"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Loads Turnstile's script once per page; every widget waits on the same
 * load. A failed load is forgotten, so the next widget tries again.
 */
export function loadTurnstile(): Promise<TurnstileApi> {
	if (window.turnstile) return Promise.resolve(window.turnstile);

	const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
	return new Promise((resolve, reject) => {
		const script = existing ?? document.createElement("script");
		const settle = () => {
			if (window.turnstile) resolve(window.turnstile);
			else reject(new Error("Turnstile did not load"));
		};
		script.addEventListener("load", settle, { once: true });
		script.addEventListener(
			"error",
			() => {
				script.remove();
				reject(new Error("Turnstile did not load"));
			},
			{ once: true },
		);
		if (!existing) {
			script.src = TURNSTILE_SCRIPT_URL;
			script.async = true;
			script.defer = true;
			script.dataset.turnstile = "";
			document.head.append(script);
		}
	});
}
