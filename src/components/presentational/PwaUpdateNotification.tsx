import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Snackbar } from '@mui/material';
import { memo, useCallback, useEffect, useState, type FC } from 'react';

const PwaUpdateNotification: FC = () => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined' || !('workbox' in window)) {
			return;
		}

		const wb = (window as any).workbox;

		// Show notification when a new service worker is waiting to activate
		const onWaiting = () => {
			setShow(true);
		};

		// Reload the page when a new service worker takes control (update only, not first install)
		const onControlling = (event: any) => {
			if (event.isUpdate) {
				window.location.reload();
			}
		};

		wb.addEventListener('waiting', onWaiting);
		wb.addEventListener('controlling', onControlling);

		return () => {
			wb.removeEventListener('waiting', onWaiting);
			wb.removeEventListener('controlling', onControlling);
		};
	}, []);

	const handleRefresh = useCallback(() => {
		if (typeof window === 'undefined' || !('workbox' in window)) {
			return;
		}

		const wb = (window as any).workbox;

		// Tell the waiting service worker to skip waiting and become active
		wb.messageSkipWaiting();
	}, []);

	const handleClose = useCallback(() => {
		setShow(false);
	}, []);

	return (
		<Snackbar
			open={show}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			message={
				<Box display="flex" alignItems="center" gap={1}>
					<AutoAwesomeIcon fontSize="small" />
					Update available
				</Box>
			}
			action={
				<Box display="flex" alignItems="center" gap={1}>
					<Button color="primary" variant="contained" size="small" onClick={handleRefresh}>
						Refresh
					</Button>
					<IconButton size="small" color="inherit" onClick={handleClose} aria-label="close">
						<CloseIcon fontSize="small" />
					</IconButton>
				</Box>
			}
		/>
	);
};

export default memo(PwaUpdateNotification);
