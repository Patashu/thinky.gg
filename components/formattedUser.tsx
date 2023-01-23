import Link from 'next/link';
import React from 'react';
import getProfileSlug from '../helpers/getProfileSlug';
import User from '../models/db/user';
import Avatar from './avatar';

interface FormattedUserProps {
  noLinks?: boolean;
  onClick?: () => void;
  size?: number;
  user?: User;
}

export default function FormattedUser({ noLinks, onClick, size, user }: FormattedUserProps) {
  if (!user) {
    return (
      <div className={'flex items-center gap-2'}>
        [deleted]
      </div>
    );
  }

  return (
    <div className={'flex items-center gap-2'}>
      {noLinks ?
        <>
          <Avatar size={size} user={user} />
          <span>{user.name}</span>
        </>
        :
        <>
          <Link href={getProfileSlug(user)} passHref>
            <Avatar size={size} user={user} />
          </Link>
          <Link
            className='font-bold underline'
            href={getProfileSlug(user)}
            onClick={onClick}
            passHref
          >
            <span>{user.name}</span>
          </Link>
        </>
      }
    </div>
  );
}
