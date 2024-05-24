import { createTheme } from '@mui/material';
import { black } from '@mui/material/colors';

export default createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: black[600],
			light: black[400],
			dark: black[800],
			contrastText: '#FFFFFF'
		},
		secondary: {
			main: '#2D2D2D',
			light: '#36393F',
			dark: '#212121',
			contrastText: '#FFFFFF'
		},
		background: {
			default: '#16171D'
		},
		common: {
			white: '#EEEEEE',
			black: '#16171D'
		},
		error: {
			main: '#C62828',
			dark: '#8E0000',
			light: '#FF5F52'
		}
	}
});
