import type { OauthFlattenedGuild } from '~~/shared/types/discord';

const useGuild = () => {
	const guildData = useState<NonNullable<OauthFlattenedGuild> | null>(() => null);

	return guildData;
};
export default useGuild;
