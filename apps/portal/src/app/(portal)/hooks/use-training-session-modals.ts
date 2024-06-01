import { fetchUpdateTrainingSession } from '@/actions/training-session/fetch-update.training-session.actions';
import {
  SingleTrainingSession,
  singleTrainingSession,
} from '@/actions/training-session/single.training-session.actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { TrainingSession, UserRole } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

export type ViewSessionState = {
  dataView: SingleTrainingSession;
  nextId?: string;
  prevId?: string;
};

const useTrainingSessionModals = ({
  trainingSessionIds,
  selectedSessionId,
  programId,
}: {
  trainingSessionIds: string[];
  selectedSessionId?: string;
  programId?: string;
}) => {
  const user = useCurrentUser();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [modal, setModal] = useState<
    | { type: 'update'; dataUpdate: TrainingSession }
    | ({ type: 'view' } & ViewSessionState)
    | { type: 'delete'; id: string }
    | { type: 'new'; programId: string }
    | undefined
  >();
  const [isPending, startTransition] = useTransition();

  const dismissModal = useCallback(() => {
    setModal(undefined);
    if (selectedSessionId) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('trainingSessionId');
      const updatedParams = params.toString();
      const newParams = updatedParams ? `${path}?${updatedParams}` : path;
      router.push(newParams);
    } else {
      router.refresh();
    }
  }, [router, selectedSessionId, searchParams, path]);

  const sessionUpdate = useCallback(
    (id: string) => {
      if (isAdmin)
        startTransition(() => {
          fetchUpdateTrainingSession(id).then((data) => {
            if ('error' in data) {
              toast.error(data.error);
            } else {
              updateSession(data);
            }
          });
        });
    },
    [startTransition],
  );

  const updateSession = useCallback((dataUpdate: TrainingSession) => {
    if (isAdmin) setModal({ type: 'update', dataUpdate });
  }, []);
  const updateData =
    !!modal &&
    modal.type === 'update' &&
    typeof modal.dataUpdate === 'object' &&
    isAdmin
      ? modal.dataUpdate
      : undefined;

  const viewSession = useCallback(
    (id: string) =>
      startTransition(() => {
        singleTrainingSession({ id, user }).then((dataView) => {
          if ('error' in dataView) {
            toast.error(dataView.error);
          } else {
            const currentId = trainingSessionIds.findIndex(
              (sessionId) => sessionId === id,
            );
            const nextId = trainingSessionIds[currentId + 1];
            const prevId = trainingSessionIds[currentId - 1];
            setModal({ type: 'view', dataView, nextId, prevId });
          }
        });
      }),
    [startTransition, trainingSessionIds, user],
  );
  const viewData: ViewSessionState | undefined =
    !!modal && modal.type === 'view' && typeof modal.dataView === 'object'
      ? { dataView: modal.dataView, nextId: modal.nextId, prevId: modal.prevId }
      : undefined;

  const deleteSession = useCallback((id: string) => {
    if (isAdmin) setModal({ type: 'delete', id });
  }, []);
  const deleteId =
    !!modal &&
    modal.type === 'delete' &&
    typeof modal.id === 'string' &&
    isAdmin
      ? modal.id
      : undefined;

  const newSession = useCallback((id: string) => {
    if (!!programId && isAdmin) setModal({ type: 'new', programId });
  }, []);
  const newProgramId =
    !!modal && modal.type === 'new' && !!modal.programId && isAdmin
      ? modal.programId
      : undefined;

  return {
    isPending,
    startTransition,
    dismissModal,
    sessionUpdate,
    updateSession,
    updateData,
    viewSession,
    viewData,
    deleteSession,
    deleteId,
    newSession,
    newProgramId,
    path,
    user,
  };
};

export default useTrainingSessionModals;
