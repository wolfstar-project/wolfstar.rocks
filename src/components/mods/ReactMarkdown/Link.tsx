import { Typography } from '@mui/material';
import RouterLink from '@routing/Link';
import { forwardRef, type AnchorHTMLAttributes, type DetailedHTMLProps } from 'react';
import type { WithReactMarkdownChildren } from './types';

const WolfStarPwPathRegex = /<?https:\/\/wolfstar\.pw(?<path>\/[a-z]+)?>?/;

type LinkProps = WithReactMarkdownChildren<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>>;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ children, href }, ref) => {
	// If there is no href then this is actually referring to an optional argument so we parse it literally
	if (!href) {
		return (
			<Typography component="span" color="textPrimary" variant="body2" ref={ref}>
				{'['}
				{children}
				{']'}
			</Typography>
		);
	}

	// If the link starts with a / then it is an internal link
	if (href.startsWith('https://wolfstar.rocks')) {
		return (
			<RouterLink
				href={href.endsWith('pw') ? '/' : WolfStarPwPathRegex.exec(href)?.groups?.path ?? href}
				ref={ref}
				text={children}
				TextTypographyProps={{
					sx: {
						wordBreak: 'break-word'
					}
				}}
			/>
		);
	}

	// If the href doesn't start with `http` then it's not a valid URL so we don't want to parse it as a clickable link
	if (!href.startsWith('http')) {
		return (
			<Typography
				ref={ref}
				component="span"
				color="primary"
				variant="body2"
				sx={{
					wordBreak: 'break-word'
				}}
			>
				{children}
			</Typography>
		);
	}

	// Otherwise show a link
	return (
		<RouterLink
			href={href}
			ref={ref}
			text={children}
			TextTypographyProps={{
				sx: {
					wordBreak: 'break-word'
				}
			}}
		/>
	);
});

export default Link;
