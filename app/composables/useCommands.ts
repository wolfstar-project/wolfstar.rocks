import type { BotApiCommand } from "#shared/utils/bot-api-commands";
import { normalizeBotCommands } from "#shared/utils/bot-api-commands";

export function useCommands(options?: ApiComposableOptions) {
	const result = createApiComposable<BotApiCommand[]>(
		"wolfstar:commands",
		"/commands",
		[],
		options,
	);

	return {
		...result,
		data: computed(() => normalizeBotCommands(result.data.value)),
	};
}
