import PageContent from '@pages/GuildsPage';
import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';

const GuildsPage: NextPage = () => {
	return (
		<>
			<NextSeo
				title="Guilds"
				description="Quickly access all the servers that have WolfStar Discord bot in it and that you can manage through this dashboard"
				openGraph={{
					title: 'Your WolfStar servers'
				}}
				additionalMetaTags={[
					{
						name: 'summary',
						content: 'Quickly access all the servers that have WolfStar Discord bot in it and that you can manage through this dashboard'
					}
				]}
			/>

			<PageContent />
		</>
	);
};

export default GuildsPage;
