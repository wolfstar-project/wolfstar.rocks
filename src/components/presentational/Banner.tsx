import { Alert, Link, Typography } from '@mui/material';
import type { FC } from 'react';

const Banner: FC = () => {
	return (
		<Alert severity="info" variant="filled" square sx={{ justifyContent: 'center', display: 'flex', width: '100%' }}>
			<Typography variant="body2">
				try the new version of site{' '}
				<Link href="https://beta.wolfstar.rocks" color="inherit" underline="always">
					https://beta.wolfstar.rocks
				</Link>
			</Typography>
		</Alert>
	);
};

export default Banner;
