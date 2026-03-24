export function useCommands(options?: ApiComposableOptions) {
	return createApiComposable<FlattenedCommand[]>("wolfstar:commands", "/commands", [], options);
}
