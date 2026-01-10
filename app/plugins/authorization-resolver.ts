export default defineNuxtPlugin({
  name: "authorization-resolver",
  parallel: true,
  setup() {
    const { data: session } = useAuthSession();
    return {
      provide: {
        authorization: {
          resolveClientUser: () => session.value?.user ?? null,
        },
      },
    };
  },
});
