import { ProfileQueryType } from '@root/constants/profileQueryType';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import getProfileSlug from '../../helpers/getProfileSlug';
import User from '../../models/db/user';
import LoadingSpinner from '../page/loadingSpinner';
import RoleIcons from '../page/roleIcons';
import StyledTooltip from '../page/styledTooltip';
import PlayerRank from '../profile/playerRank';
import ProfileAvatar from '../profile/profileAvatar';
import FormattedDate from './formattedDate';

interface FormattedUserProps {
  // NB: this id should not contain the user id
  id: string;
  noLinks?: boolean;
  noTooltip?: boolean;
  onClick?: () => void;
  size?: number;
  user?: User | null;
}

const cache = {} as { [key: string]: any};

export default function FormattedUser({ id, noLinks, noTooltip, onClick, size, user }: FormattedUserProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [userExtendedData, setUserExtendedData] = useState<any>();
  const setTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!showTooltip || !user || userExtendedData) {
      return;
    }

    if (cache[user._id.toString()]) {
      setUserExtendedData(cache[user._id.toString()]);

      return;
    }

    fetch(`/api/user/${user._id}?type=${Object.values(ProfileQueryType).join(',')}`).then(async res => {
      const data = await res.json();

      setUserExtendedData(data);
      cache[user._id.toString()] = data;
    });
  }, [showTooltip, user, userExtendedData]);

  // NB: user could be an empty object here if it came from a projection after using preserveNullAndEmptyArrays
  if (!user || Object.keys(user).length === 0) {
    return (
      <div className='flex items-center font-bold gap-2 truncate'>
        <span className='truncate'>
          [deleted]
        </span>
      </div>
    );
  }

  const tooltipId = `formatted-user-${user._id.toString()}-${id}`;

  return (<>
    <div
      className='flex items-center gap-2 truncate w-fit'
      data-tooltip-html={renderToStaticMarkup(
        <div className='flex flex-col gap-0.5 p-1 items-start text-sm'>
          {!userExtendedData ? <LoadingSpinner /> : <>
            <span className='font-bold text-base'>{userExtendedData.user.name}</span>
            <div className='flex gap-1'>
              <span className='font-medium'>Rank:</span>
              <PlayerRank
                levelsCompletedByDifficulty={userExtendedData.levelsCompletedByDifficulty}
                user={user}
              />
            </div>
            <div className='flex gap-1'>
              <span className='font-medium'>Levels Completed:</span>
              <span className='gray'>{userExtendedData.user.score}</span>
            </div>
            <div className='flex gap-1'>
              <span className='font-medium'>Registered:</span>
              <FormattedDate ts={userExtendedData.user.ts} />
            </div>
          </>}
        </div>
      )}
      data-tooltip-id={tooltipId}
      onMouseOut={() => {
        if (setTimer.current) {
          clearTimeout(setTimer.current);
        }

        setShowTooltip(false);
      }}
      onMouseOver={() => {
        if (setTimer.current) {
          clearTimeout(setTimer.current);
        }

        setTimer.current = setTimeout(() => setShowTooltip(true), 200);
      }}
    >
      {noLinks ?
        <>
          <ProfileAvatar size={size} user={user} />
          <span className='truncate'>{user.name}</span>
        </>
        :
        <>
          <Link href={getProfileSlug(user)} passHref>
            <ProfileAvatar size={size} user={user} />
          </Link>
          <Link
            className='font-bold underline truncate'
            href={getProfileSlug(user)}
            onClick={onClick}
            passHref
          >
            {user.name}
          </Link>
        </>
      }
      <RoleIcons user={user} />
    </div>
    {!noTooltip && <StyledTooltip id={tooltipId} />}
  </>);
}
