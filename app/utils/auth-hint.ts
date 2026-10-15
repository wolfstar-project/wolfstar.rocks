/**
 * What the header's account area looked like last time in this browser: signed
 * in with a name, or signed out. Pages are prerendered and the session is only
 * known once the client asks for it, so the header draws a skeleton until then;
 * this hint picks which one, before the first paint, so nothing moves when the
 * session arrives. See `HeaderAuthSkeleton.vue`.
 */
export const AUTH_HINT_STORAGE_KEY = "wolfstar-auth-hint";

/**
 * Runs in `<head>` before the body is painted: marks `<html>` as signed in and
 * hands the name to CSS, which sizes the signed-in skeleton like the real one.
 * Kept to plain ES5 and wrapped in a `try`, since it runs before anything else.
 */
export const AUTH_HINT_SCRIPT = `(function(){try{var h=JSON.parse(localStorage.getItem("${AUTH_HINT_STORAGE_KEY}")||"null");if(h&&typeof h.name==="string"){var r=document.documentElement;r.setAttribute("data-auth","user");r.style.setProperty("--auth-name",JSON.stringify(h.name));}}catch(e){}})();`;

/** Records the account the header shows now, or that nobody is signed in. */
export function writeAuthHint(name: string | null): void {
	const root = document.documentElement;
	try {
		if (name === null) localStorage.removeItem(AUTH_HINT_STORAGE_KEY);
		else localStorage.setItem(AUTH_HINT_STORAGE_KEY, JSON.stringify({ name }));
	} catch {
		// Storage refused: the hint is only an optimisation.
	}
	if (name === null) {
		root.removeAttribute("data-auth");
		root.style.removeProperty("--auth-name");
	} else {
		root.setAttribute("data-auth", "user");
		root.style.setProperty("--auth-name", JSON.stringify(name));
	}
}
