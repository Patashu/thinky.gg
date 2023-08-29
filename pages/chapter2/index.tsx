import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Link from 'next/link';
import React from 'react';
import FormattedCampaign from '../../components/formatted/formattedCampaign';
import LinkInfo from '../../components/formatted/linkInfo';
import Page from '../../components/page/page';
import getCampaignProps, { CampaignProps } from '../../helpers/getCampaignProps';
import { getUserFromToken } from '../../lib/withAuth';
import { UserModel } from '../../models/mongoose';

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

  const chapterUnlocked = reqUser.chapterUnlocked ?? 1;

  if (chapterUnlocked === 1) {
    const { props } = await getCampaignProps(reqUser, 'chapter1');

    if (!props) {
      return {
        redirect: {
          destination: '/play',
          permanent: false,
        },
      };
    }

    const remainingLevels = Math.ceil(props.totalLevels * 0.75) - props.completedLevels;
    const isChapter1Complete = remainingLevels <= 0 && props.enrichedCollections.filter(c => !c.isThemed).every(c => Math.ceil(c.levelCount * 0.5) - c.userCompletedCount <= 0);

    if (!isChapter1Complete) {
      return {
        redirect: {
          destination: '/play',
          permanent: false,
        },
      };
    }

    await UserModel.updateOne({ _id: reqUser._id }, { $set: { chapterUnlocked: 2 } });
    // TODO: unlock achievement here for completing chapter 1
  }

  return await getCampaignProps(reqUser, 'chapter2');
}

/* istanbul ignore next */
export default function Chapter2Page({ completedLevels, enrichedCollections, reqUser, totalLevels }: CampaignProps) {
  return (
    <Page folders={[new LinkInfo('Chapter Select', '/play')]} title={'Chapter 2'}>
      <FormattedCampaign
        completedElement={
          <div className='flex flex-col items-center justify-center text-center mt-2'>
            <div>Congratulations! You&apos;ve completed every level in Chapter 2. Try out <Link className='font-bold underline' href='/chapter3' passHref>Chapter 3</Link> next!</div>
          </div>
        }
        completedLevels={completedLevels}
        enrichedCollections={enrichedCollections}
        levelHrefQuery={'chapter=2'}
        nextHref={'/chapter3'}
        nextTitle={(reqUser.chapterUnlocked ?? 1) < 3 ? 'Unlock Chapter 3' : undefined}
        subtitle={'Into the Depths'}
        title={'Chapter 2'}
        totalLevels={totalLevels}
      />
    </Page>
  );
}
