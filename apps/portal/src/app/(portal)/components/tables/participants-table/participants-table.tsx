'use client';

import {
  ParticipantsTableProps,
  SingleParticipantDetail,
  filterParticipants,
} from '@/actions/participants/fetch.participants.actions';
import useParticipantModals from '@/app/(portal)/hooks/use-participant-modals';
import handleTableColumns from '@/components/table/handle-table-columns';
import ReusableTable from '@/components/table/reusable-table';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import TableViews from '@/components/table/table-views';
import { cn } from '@/lib/utils';
import {
  FilterParticipantsType,
  PathParticipantsType,
  filterParticipantsSchema,
  pathParticipantsSchema,
} from '@/validation/participants/participants.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React, { useEffect, useMemo } from 'react';
import { SubmitHandler } from 'react-hook-form';
import participantColumnActions from './columns/participant-column-actions';
import participantColumnApplication from './columns/participant-column-application';
import participantColumnPhone from './columns/participant-column-email';
import participantColumnNationalId from './columns/participant-column-nationalid';
import participantColumnOrganization from './columns/participant-column-organization';
import participantColumnRole from './columns/participant-column-role';
import participantColumnUser from './columns/participant-column-user';
import filterParticipantsFields from './filters/participants-filter-fields';
import ParticipantsFilterForm from './filters/participants-filter-form';
import UpdateRoleModal from './modals/update-role-modal';
import ViewParticipant from './modals/view-participant';

type TableParticipantsProps = React.ComponentPropsWithoutRef<'div'> &
  ParticipantsTableProps & { selectedParticipantId?: string };

export type ParticipantModal = { id: string; handleDismiss: () => void };

const ParticipantsTable = ({
  participants,
  selectedParticipantId,
  count,
  fetchParams,
  className,
  ...props
}: TableParticipantsProps) => {
  const {
    path,
    isAdmin,
    isPending,
    startTransition,
    dataUpdate,
    dataView,
    dismissModal,
    updateUserRole,
    viewParticipant,
  } = useParticipantModals({
    participantIds: participants.map(({ id }) => id),
    selectedParticipantId,
  });
  const pathParams: PathParticipantsType = pathParticipantsSchema.parse({
    ...fetchParams,
    path,
  });

  const { hiddenColumns, page, pageSize } = pathParams;
  const filterValues: FilterParticipantsType =
    filterParticipantsSchema.parse(pathParams);

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        page: pageInt.toString(),
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });
  };

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        hiddenColumns: hideColumns,
      });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      filterParticipants({
        path,
        page: '1',
        pageSize,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterParticipantsType> = (values) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        ...values,
      });
    });
  };

  useEffect(() => {
    if (selectedParticipantId) {
      viewParticipant(selectedParticipantId);
    }
  }, [selectedParticipantId]);

  const hiddenColumnsArray = useMemo(
    () => (hiddenColumns ? hiddenColumns.split(',') : []),
    [hiddenColumns],
  );

  const { visibleColumns, allColumnIds } =
    handleTableColumns<SingleParticipantDetail>({
      hiddenColumnsArray,
      columns: [
        tableSelectColumn<SingleParticipantDetail>(isPending),
        participantColumnUser,
        participantColumnActions({ isPending, viewParticipant }),
        ...(isAdmin
          ? [participantColumnRole({ isAdmin, updateRole: updateUserRole })]
          : []),
        participantColumnPhone,
        participantColumnNationalId,
        participantColumnOrganization,
        participantColumnApplication,
      ],
    });

  const table = useReactTable({
    data: participants,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className={cn('flex flex-col space-y-4', className)} {...props}>
        <ParticipantsFilterForm
          isPending={isPending}
          clearFilters={clearFilters}
          customSubmit={onSubmit}
          filterValues={filterValues}
          filterForm={filterParticipantsFields(isPending)}
        />
        <div className="pb-4 space-y-2">
          <TableViews
            columnIds={allColumnIds}
            hiddenColumnArray={hiddenColumnsArray}
            isPending={isPending}
            updateViews={updateViews}
          />
          <ReusableTable table={table} />
        </div>
        <TablesPagination
          changePage={changePage}
          changePageSize={changePageSize}
          isPending={isPending}
          pagination={{ page, pageSize }}
          count={count}
        />
      </div>
      {dataUpdate && (
        <UpdateRoleModal handleDismiss={dismissModal} {...dataUpdate} />
      )}
      {dataView && (
        <ViewParticipant
          {...{
            dataView,
            isPending,
            dismissModal,
            updateRole: updateUserRole,
            viewParticipant,
          }}
        />
      )}
    </>
  );
};

export default ParticipantsTable;
