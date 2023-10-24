import { MusicContext } from '@root/contexts/musicContext';
import { PageContext } from '@root/contexts/pageContext';
import React, { useContext, useEffect, useState } from 'react';
import Collection from '../../models/db/collection';
import { EnrichedLevel } from '../../models/db/level';
import User from '../../models/db/user';
import PostGameModal from '../modal/postGameModal';
import Game from './game';
import Sidebar from './sidebar';

interface GameWrapperProps {
  chapter?: string;
  collection: Collection | undefined;
  level: EnrichedLevel;
  onNext: () => void;
  onPrev: () => void;
  user: User | null;
}

export default function GameWrapper({ chapter, collection, level, onNext, onPrev, user }: GameWrapperProps) {
  const { isDynamic, isDynamicSupported, toggleVersion } = useContext(MusicContext);
  const [dontShowPostGameModal, setDontShowPostGameModal] = useState(false);
  const [postGameModalOpen, setShowPostGameModalOpen] = useState(false);
  const [mutePostGameModalForThisLevel, setMutePostGameModalForThisLevel] = useState(false);
  const { setPreventKeyDownEvent } = useContext(PageContext);

  useEffect(() => {
    const storedPref = localStorage.getItem('dontShowPostGameModal');
    const storedPrefExpire = localStorage.getItem('dontShowPostGameModalExpire');

    if (storedPrefExpire && new Date(storedPrefExpire) < new Date()) {
      localStorage.removeItem('dontShowPostGameModal');
      localStorage.removeItem('dontShowPostGameModalExpire');

      return;
    }

    if (storedPref === 'true') {
      setDontShowPostGameModal(true);
    }
  }, [level._id]);

  useEffect(() => {
    setMutePostGameModalForThisLevel(false);
  }, [level._id]);

  return (
    <div className='flex h-full'>
      <Game
        allowFreeUndo={true}
        disablePlayAttempts={!user}
        disableStats={!user}
        enableSessionCheckpoint={true}
        key={`game-${level._id.toString()}`}
        level={level}
        onNext={collection ? onNext : undefined}
        onPrev={collection ? onPrev : undefined}
        onSolve={() => {
          if (isDynamicSupported && isDynamic) {
            toggleVersion('hot');
          }

          if (!dontShowPostGameModal && !mutePostGameModalForThisLevel) {
            setTimeout(() => {
              setShowPostGameModalOpen(true);
              setMutePostGameModalForThisLevel(true);
              setPreventKeyDownEvent(true);
            }, 200);
          }
        }}
      />
      <Sidebar level={level} />
      <PostGameModal
        chapter={chapter}
        closeModal={() => {
          setShowPostGameModalOpen(false);
          setPreventKeyDownEvent(false);
        }}
        collection={collection}
        dontShowPostGameModal={dontShowPostGameModal}
        isOpen={postGameModalOpen}
        level={level}
        reqUser={user}
        setDontShowPostGameModal={setDontShowPostGameModal}
      />
    </div>
  );
}
