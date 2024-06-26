import type { TransformedLoginData } from '@config/types/ApiData';
import Link from '@routing/Link';
import { guildAddURL } from '@utils/constants';
import { cloneElement, memo } from 'react';
import type { ValuesType } from 'utility-types';
import styles from './GuildCard.module.css';
import GuildIcon from './GuildIcon';

import { Card, CardHeader } from '@mui/material';

interface GuildCardProps {
	guild: ValuesType<NonNullable<TransformedLoginData['transformedGuilds']>>;
}

const GuildCard = memo<GuildCardProps>(({ guild }) => (
	<Link href={guild.wolfstarIsIn ? `/guilds/${guild.id}` : guildAddURL(guild.id)} className={styles.link}>
		<Card
			elevation={2}
			sx={{
				minWidth: 230,
				maxWidth: {
					md: 230,
					xs: '90vw'
				},
				width: {
					md: 'inherit',
					xs: '90vw'
				},
				minHeight: 80,
				maxHeight: 80,
				bgcolor: 'secondary.main',
				m: 2,
				'&:hover': {
					cursor: 'pointer'
				}
			}}
		>
			<CardHeader
				classes={{ root: styles.headerRoot, content: styles.headerContent }}
				subheader={!guild.wolfstarIsIn && 'Click to invite WolfStar'}
				avatar={<GuildIcon guild={guild} />}
				title={guild.name}
			/>
		</Card>
	</Link>
));

export const FilteredGuildCards = (pack?: TransformedLoginData) =>
	(pack?.transformedGuilds ?? [])
		// Filter on manageable servers
		.filter((g) => g.manageable)
		// Sort by whether WolfStar is in the server or not, or sort by the name of the server
		.sort((gA, gB) =>
			gA.wolfstarIsIn === gB.wolfstarIsIn ? gA.name.localeCompare(gB.name, 'en', { sensitivity: 'base' }) : gA.wolfstarIsIn ? -1 : 1
		)
		.map((g, index) => cloneElement(<GuildCard guild={g} key={index} />));
