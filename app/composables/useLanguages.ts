export function useLanguages(options?: ApiComposableOptions) {
	return createApiComposable<string[]>("wolfstar:languages", "/api/languages", [], options);
}
