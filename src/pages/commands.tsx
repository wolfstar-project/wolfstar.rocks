import PageContent from '@pages/CommandsPage';
import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';

const CommandsPage: NextPage = () => {
	return (
		<>
			<NextSeo
				title="Commands"
				description="Want to know what WolfStar can do? You've come to the right place here. Get information about every command available in WolfStar on this page."
				openGraph={{
					title: "WolfStar's Commands"
				}}
				additionalMetaTags={[
					{
						name: 'summary',
						content:
							"Want to know what WolfStar can do? You've come to the right place here. Get information about every command available in WolfStar on this page."
					}
				]}
			/>

			<PageContent />
		</>
	);
};

export default CommandsPage;
