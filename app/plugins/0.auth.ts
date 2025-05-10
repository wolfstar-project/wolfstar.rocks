import { useUserSession } from '#imports';

export default defineNuxtPlugin(async (nuxtApp) => {
    // Skip plugin when rendering error page
    if (nuxtApp.payload.error) {
        return {};
    }

    const { ready, loggedIn, user, session, fetch, openInPopup, clear } = useUserSession();

    // Create a ref to know where to redirect the user when logged in
    const redirectTo = useState<string>('authRedirect', () => '/');

    // Add global route middleware to protect pages using:
    // definePageMeta({ auth: true })
    addRouteMiddleware(
        'auth',
        (to) => {
            if (to.meta.auth && !loggedIn.value) {
                redirectTo.value = to.path;
                return '/login';
            }
        },
        { global: true },
    );

    const currentRoute = useRoute();

    if (import.meta.client) {
        watch(loggedIn, async (isLoggedIn) => {
            if (!isLoggedIn && currentRoute.meta.auth) {
                redirectTo.value = currentRoute.path;
                await navigateTo('/login');
            }
        });
    }

    return {
        provide: {
            auth: {
                loggedIn,
                user,
                session,
                redirectTo,
                clear,
                ready,
                fetch,
                openInPopup,
            },
        },
    };
});
