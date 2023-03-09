import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import toast from 'react-hot-toast';
import { PageContext } from '../../contexts/pageContext';
import Collection from '../../models/db/collection';
import Modal from '.';

interface DeleteCollectionModalProps {
  closeModal: () => void;
  collection: Collection;
  isOpen: boolean;
}

export default function DeleteCollectionModal({ collection, closeModal, isOpen }: DeleteCollectionModalProps) {
  const { mutateUser, user } = useContext(PageContext);
  const router = useRouter();

  function onConfirm() {
    toast.dismiss();
    toast.loading('Deleting collection...');

    fetch(`/api/collection/${collection._id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(res => {
      if (res.status === 200) {
        closeModal();
        mutateUser();

        if (user) {
          router.push(`/profile/${user.name}/collections`);
        }
      } else {
        throw res.text();
      }
    }).catch(err => {
      console.trace(err);
      toast.dismiss();
      toast.error('Error deleting collection');
    }).finally(() => {
      toast.dismiss();
      toast.success('Deleted');
    });
  }

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      onConfirm={onConfirm}
      title={'Delete Collection'}
    >
      <div style={{ textAlign: 'center' }}>
        {`Are you sure you want to delete your collection '${collection.name}'?`}
        <br />
        {'Levels within this collection will not be deleted.'}
      </div>
    </Modal>
  );
}
