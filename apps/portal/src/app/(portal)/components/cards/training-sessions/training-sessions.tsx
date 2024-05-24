'use client';
import {
  FetchTrainingSessionsReturn,
  filterTrainingSessions,
} from '@/actions/training-session/fetch.training-sessions.actions';
import ResponsiveGrid from '@/components/layouts/responsive-grid';
import TablesPagination from '@/components/table/table-pagination';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import { FilterSessionsSchema } from '@/validation/training-session/fetch.sessions.validations';
import { TrainingSession, UserRole } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import TrainingSessionCard from './cards/training-session-card';
import trainingFilterFields from './filters/training-session-fields';
import TrainingSessionFilters from './filters/training-session-filters';
import DeleteSession from './modals/delete-session';
import SessionModal from './modals/session-modal';

type TrainingSessionsProps = React.ComponentPropsWithoutRef<'section'> &
  FetchTrainingSessionsReturn & { programId?: string };

const TrainingSessions = ({
  trainingSessions,
  count,
  firstEndDate,
  lastEndDate,
  firstStartDate,
  lastStartDate,
  modeOptions,
  venueOptions,
  showProgram,
  programId,
  params,
  className,
  ...props
}: TrainingSessionsProps) => {
  const user = useCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<
    | { type: 'update'; data: TrainingSession }
    | { type: 'delete'; id: string }
    | { type: 'new'; programId: string }
    | undefined
  >();

  const { pageSize, page, showPast } = params;
  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        page: pageInt.toString(),
        path,
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        page: '1', // Reset to page 1 to avoid out of bounds error
        pageSize: newPageSize,
        path,
      });
    });
  };

  const clearFilters = () =>
    startTransition(() => {
      filterTrainingSessions({
        path,
        page: '1',
        pageSize,
      });
    });

  const onSubmit: SubmitHandler<FilterSessionsSchema> = (values) =>
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        ...values,
        path,
      });
    });

  const updateViews = (isShowPast: 'true' | 'false') =>
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        page: '1',
        showPast: isShowPast,
        path,
      });
    });

  const updateSession = (data: TrainingSession) =>
    setModal((prev) => ({ type: 'update', data }));
  const isUpdate =
    !!modal &&
    modal.type === 'update' &&
    typeof modal.data === 'object' &&
    isAdmin;

  const deleteSession = (id: string) =>
    setModal((prev) => ({ type: 'delete', id }));
  const isDelete =
    !!modal &&
    modal.type === 'delete' &&
    typeof modal.id === 'string' &&
    isAdmin;

  const newSession = (programId: string) =>
    setModal((prev) => ({ type: 'new', programId }));
  const isNew = !!modal && modal.type === 'new' && !!modal.programId && isAdmin;

  const dismissModal = () => setModal(undefined);

  return (
    <>
      <section
        className={cn(
          'flex flex-col w-full px-2 lg:px-6 py-4 space-y-4',
          className,
        )}
        {...props}
      >
        <TrainingSessionFilters
          values={params}
          isPending={isPending}
          filterForm={trainingFilterFields({
            firstEndDate,
            lastEndDate,
            firstStartDate,
            lastStartDate,
            modeOptions,
            venueOptions,
            showProgram,
          })}
          clearFilters={clearFilters}
          customSubmit={onSubmit}
          updateViews={updateViews}
          newSession={newSession}
          programId={programId}
        />
        <ResponsiveGrid>
          {trainingSessions.map((data) => (
            <TrainingSessionCard
              {...{
                data,
                isPending,
                user,
                updateSession,
                deleteSession,
                showProgram,
                showPast,
              }}
            />
          ))}
        </ResponsiveGrid>
        <TablesPagination
          changePage={changePage}
          changePageSize={changePageSize}
          isPending={isPending}
          pagination={{ page, pageSize }}
          count={count}
          pageSizeSteps={12}
        />
      </section>
      {isUpdate && (
        <SessionModal {...{ trainingSession: modal.data, dismissModal }} />
      )}
      {isNew && (
        <SessionModal {...{ programId: modal.programId, dismissModal }} />
      )}
      {isDelete && <DeleteSession {...{ id: modal.id, dismissModal }} />}
    </>
  );
};

export default TrainingSessions;
