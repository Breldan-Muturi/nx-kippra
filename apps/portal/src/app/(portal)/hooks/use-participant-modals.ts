import {
  SingleApplicationParticipant,
  getSingleParticipant,
} from '@/actions/participants/single.participant.actions';
import { useCurrentRole } from '@/hooks/use-current-role';
import { UserRole } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

export type UpdateRoleParams = { id: string; updateToAdmin: boolean };
export type ViewParticipantParams = {
  participant: SingleApplicationParticipant;
  nextId?: string;
  prevId?: string;
};

const useParticipantModals = (participantIds: string[]) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin = useCurrentRole() === UserRole.ADMIN;
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<
    | undefined
    | { type: 'update-role'; updateData: UpdateRoleParams }
    | { type: 'view'; viewData: ViewParticipantParams }
  >();
  const selectedParticipantId = searchParams.get('participantId');

  const removeParticipantIdFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('participantId');
    const updatedParams = params.toString();
    const newParams = updatedParams ? `${path}?${updatedParams}` : path;
    router.push(newParams);
  }, [path, router, searchParams]);

  const dismissModal = useCallback(() => {
    setModal(undefined);
    if (selectedParticipantId) {
      removeParticipantIdFromUrl();
    } else {
      router.refresh();
    }
  }, [router, path, searchParams, selectedParticipantId]);

  const updateUserRole = useCallback(
    ({ id, updateToAdmin }: { id: string; updateToAdmin: boolean }) => {
      if (!isAdmin) {
        toast.error('Only admins can update user roles');
      } else {
        setModal({ type: 'update-role', updateData: { id, updateToAdmin } });
      }
    },
    [isAdmin],
  );
  const dataUpdate =
    !!modal && 'updateData' in modal && modal.type === 'update-role' && isAdmin
      ? modal.updateData
      : undefined;

  const viewParticipant = useCallback(
    (id: string) =>
      startTransition(() => {
        if (selectedParticipantId) {
          removeParticipantIdFromUrl();
        }
        getSingleParticipant(id).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            const participantIndex = participantIds.findIndex(
              (participantId) => participantId === id,
            );
            const nextId = participantIds[participantIndex + 1];
            const prevId = participantIds[participantIndex - 1];
            setModal({
              type: 'view',
              viewData: { participant: data.participant, nextId, prevId },
            });
          }
        });
      }),
    [participantIds, removeParticipantIdFromUrl, selectedParticipantId],
  );

  const dataView =
    !!modal && 'viewData' in modal && modal.type === 'view'
      ? modal.viewData
      : undefined;

  useEffect(() => {
    if (selectedParticipantId && participantIds.includes(selectedParticipantId))
      viewParticipant(selectedParticipantId);
  }, [selectedParticipantId, participantIds]);

  return {
    path,
    isAdmin,
    isPending,
    startTransition,
    dismissModal,
    updateUserRole,
    dataUpdate,
    viewParticipant,
    dataView,
  };
};

export default useParticipantModals;
