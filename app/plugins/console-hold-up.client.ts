/* eslint-disable no-console */
import { isProduction } from "std-env";

const WARNING_TITLE = "⚠️ WARNING! ⚠️";
const SCAM_WARNING = "If someone told you to copy/paste something here, it is very likely a scam.";
const ACCOUNT_WARNING = "Pasting code here could give attackers access to your account.";

/**
 * Client-side security plugin that displays console warnings to deter
 * self-XSS attacks and social engineering scams in production environments.
 *
 * The warnings educate users about the risks of pasting untrusted code
 * into the browser console, a common attack vector for credential theft.
 *
 * @see https://en.wikipedia.org/wiki/Self-XSS
 */
export default defineNuxtPlugin(() => {
  if (isProduction) {
    const warningStyles = ["color: red", "background: yellow", "font-size: 24px", "font-weight: bold", "padding: 10px"].join(";");

    const messageStyles = ["color: white", "background: black", "font-size: 16px", "padding: 5px", "border: 2px solid red"].join(";");

    console.log(`%c${WARNING_TITLE}`, warningStyles);

    console.log(`%c${SCAM_WARNING}`, messageStyles);

    console.log(`%c${ACCOUNT_WARNING}`, messageStyles);
  }
});
