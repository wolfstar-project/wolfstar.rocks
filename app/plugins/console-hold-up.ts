/* eslint-disable no-console */

export default defineNuxtPlugin(() => {
    if (import.meta.client && process.env.NODE_ENV === 'production') {
        const warningStyles = ['color: red', 'background: yellow', 'font-size: 24px', 'font-weight: bold', 'padding: 10px'].join(';');

        const messageStyles = ['color: white', 'font-size: 16px', 'padding: 5px', 'border: 2px solid black'].join(';');

        console.log('%c⚠️ WARNING! ⚠️', warningStyles);

        console.log('%cIf someone told you to copy/paste something here, it is very likely a scam.', messageStyles);

        console.log('%cPasting code here could give attackers access to your account.', messageStyles);
    }
});
