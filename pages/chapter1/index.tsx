import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Link from 'next/link';
import React from 'react';
import FormattedCampaign from '../../components/formattedCampaign';
import LinkInfo from '../../components/linkInfo';
import Page from '../../components/page';
import getCampaignProps, { CampaignProps } from '../../helpers/getCampaignProps';
import { getUserFromToken } from '../../lib/withAuth';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = context.req?.cookies?.token;
  const reqUser = token ? await getUserFromToken(token, context.req as NextApiRequest) : null;

  if (!reqUser) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return await getCampaignProps(reqUser, 'chapter1');
}

/* istanbul ignore next */
export default function Chapter1Page({ completedLevels, enrichedCollections, totalLevels }: CampaignProps) {
  return (
    <Page folders={[new LinkInfo('Chapter Select', '/chapterselect')]} title={'Chapter 1'}>
      <FormattedCampaign
        completedElement={
          <div className='flex flex-col items-center justify-center text-center mt-2'>
            <div>Congratulations! You&apos;ve completed every level in Chapter 1. Try out <Link className='font-bold underline' href='/chapter2' passHref>Chapter 2</Link> next!</div>
          </div>
        }
        completedLevels={completedLevels}
        enrichedCollections={enrichedCollections}
        subtitle={'Grassroots'}
        title={'Chapter 1'}
        totalLevels={totalLevels}
        unlockRequirements={{}}
      />
    </Page>
  );
}
