import WolfStarLogo from '@assets/skyraLogo';
import { Box, Container, Hidden, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from '@routing/Link';
import { CLIENT_ID, inviteURL } from '@utils/constants';
import { memo } from 'react';

const Left = () => (
	<Box textAlign="left" display="flex" flexDirection="column">
		<Link href="https://donate.wolfstar.rocks/patreon" text="Patreon" />
		<Link href="https://donate.wolfstar.rocks/paypal" text="PayPal" />
		<Link href="https://donate.wolfstar.rocks/kofi" text="Ko-fi" />
		<Link href={`https://top.gg/bot/${CLIENT_ID}`} text="Vote" />
	</Box>
);
const Right = () => (
	<Box textAlign="right" display="flex" flexDirection="column">
		<Link href="https://join.wolfstar.rocks" text="Support Server" />
		<Link href="/privacy" text="Privacy Policy" />
		<Link href={inviteURL.toString()} text="Invite Link" />
		<Link href="https://github.com/skyra-project/skyra" text="GitHub" />
	</Box>
);

const Middle = () => (
	<Box display="flex" flexDirection="column">
		<WolfStarLogo />
		<Typography sx={{ mt: 1.875 }} variant="caption">
			Copyright © 2020 WolfStar Project. All rights reserved.
		</Typography>
	</Box>
);

const Footer = () => {
	const theme = useTheme();
	const isOnMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box
			component="footer"
			sx={{
				padding: '50px 0px',
				bgcolor: 'secondary.main',
				height: {
					sm: 200,
					xs: 'auto'
				}
			}}
		>
			<Container maxWidth="sm">
				<Hidden smDown>
					<Box
						display="flex"
						flexDirection={isOnMobile ? 'column' : undefined}
						alignContent={isOnMobile ? 'center' : undefined}
						justifyContent={isOnMobile ? 'center' : 'space-around'}
						textAlign={isOnMobile ? 'center' : undefined}
						alignItems={isOnMobile ? 'center' : undefined}
						sx={{
							'& > *:not(:first-of-type)': {
								mt: {
									sm: 'inherit',
									xs: 20
								}
							}
						}}
					>
						<Left />
						<Middle />
						<Right />
					</Box>
				</Hidden>
				<Hidden smUp>
					<Box
						display="flex"
						flexDirection={isOnMobile ? 'column' : undefined}
						alignContent={isOnMobile ? 'center' : undefined}
						justifyContent={isOnMobile ? 'center' : 'space-around'}
						textAlign={isOnMobile ? 'center' : undefined}
						alignItems={isOnMobile ? 'center' : undefined}
						sx={{
							'& > *:not(:first-of-type)': {
								mt: {
									sm: 'inherit',
									xs: 20
								}
							}
						}}
					>
						<Box display="flex" justifyContent="space-between" width="100%" px={3}>
							<Left />
							<Right />
						</Box>
						<Middle />
					</Box>
				</Hidden>
			</Container>
		</Box>
	);
};

export default memo(Footer);
