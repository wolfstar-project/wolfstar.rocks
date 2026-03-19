import { useRouteParams } from "@vueuse/router";

const _useGuildData = () => {
	const guildId = useRouteParams("id", null, { transform: String });

	const guild = useState<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(
		`guild:${guildId.value}:data`,
	);

	const setGuildData = (
		newGuildData: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>,
	) => {
		guild.value = newGuildData;
	};

	return { guildData: readonly(guild), setGuildData };
};

export const useGuildData = createSharedComposable(_useGuildData);
