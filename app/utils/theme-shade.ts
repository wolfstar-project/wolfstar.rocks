/**
 * Runs in `<head>` before the body is painted: marks `<html>` with the darker
 * of Discord's dark themes when it is the one picked, so a prerendered page
 * does not flash the Ash shade first. Plain ES5 in a `try`, like the auth hint.
 */
export const THEME_SHADE_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("wolfstar-settings")||"null");if(s&&s.colorMode==="dark"&&s.darkShade==="dark"){document.documentElement.setAttribute("data-shade","dark");}}catch(e){}})();`;
