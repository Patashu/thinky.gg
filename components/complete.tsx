import classNames from 'classnames';
import React from 'react';

interface CompleteProps {
  className?: string;
}

export default function Complete({ className }: CompleteProps) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='var(--color-complete)' className={classNames('w-6 h-6', className)} style={{ minWidth: 24, minHeight: 24 }}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12' />
    </svg>
  );
}
