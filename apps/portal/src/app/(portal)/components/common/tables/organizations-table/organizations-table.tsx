'use client';
import {
  FetchOrganizationsTable,
  SingleOrganizationDetail,
  filterOrganizations,
} from '@/actions/organization/filter.organization.actions';
import handleTableColumns from '@/components/table/handle-table-columns';
import ReusableTable from '@/components/table/reusable-table';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import TableViews from '@/components/table/table-views';
import {
  FilterOrganizationsType,
  OrganizationPathSchema,
  OrganizationTableSchema,
  filterOrganizationsSchema,
  organizationPathSchema,
} from '@/validation/organization/organization.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import OrganizationFilterForm from './filter/organizations-filter-form';
import organizationFilterFields from './filter/organizations-filter-fields';
import organizationColumnInfo from './columns/organization-column-info';
import organizationColumnActions from './columns/organization-column-actions';
import organizationColumnRole from './columns/organization-column-role';
import organizationColumnOwner from './columns/organization-column-owner';
import organizationColumnUsers from './columns/organization-column-users';
import organizationColumnInvites from './columns/organization-column-invites';
import organizationColumnApplications from './columns/organization-column-applications';
import organizationColumnParticipants from './columns/organization-column-participants';
import DeleteOrgModal, {
  DeleteOrgProps,
} from './modals/organization-modal-delete';
import RemoveOrgModal from './modals/organization-modal-remove';
import {
  RemoveOrgData,
  removeOrganizationPopup,
} from '@/actions/organization/remove.organization.actions';
import { toast } from 'sonner';

type OrganizationTableProps = {
  searchParams: OrganizationTableSchema;
  organizationTable: Exclude<FetchOrganizationsTable, { error: string }>;
};

const OrganizationsTable = ({
  searchParams,
  organizationTable: { count, organizations, existingUser },
}: OrganizationTableProps) => {
  const path = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<
    RemoveOrgData | DeleteOrgProps | undefined
  >();

  const pathParams: OrganizationPathSchema = organizationPathSchema.parse({
    ...searchParams,
    path,
  });
  const { hiddenColumns, page, pageSize } = pathParams;
  const filterValues: FilterOrganizationsType =
    filterOrganizationsSchema.parse(pathParams);

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        page: pageInt.toString(),
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });
  };

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        hiddenColumns: hideColumns,
      });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      filterOrganizations({
        path,
        page: '1',
        pageSize,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterOrganizationsType> = (values) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        ...values,
      });
    });
  };

  const hiddenColumnsArray = useMemo(
    () => (hiddenColumns ? hiddenColumns.split(',') : []),
    [hiddenColumns],
  );

  const handleRemove = (orgId: string) =>
    startTransition(() => {
      removeOrganizationPopup(orgId).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else if (data.deleteOrg) {
          setAction((prev) => ({ id: data.orgId, triggeredByRemove: true }));
        } else {
          setAction((prev) => data);
        }
      });
    });

  const handleDelete = (orgId: string) => setAction((prev) => ({ id: orgId }));
  const handleView = (orgId: string) => router.push(`/organization/${orgId}`);

  const { visibleColumns, allColumnIds } =
    handleTableColumns<SingleOrganizationDetail>({
      hiddenColumnsArray,
      columns: [
        tableSelectColumn<SingleOrganizationDetail>(isPending),
        organizationColumnInfo,
        organizationColumnActions({
          existingUser,
          isPending,
          handleView,
          handleDelete,
          handleRemove,
        }),
        organizationColumnRole({
          userId: existingUser.id,
          email: existingUser.email,
        }),
        organizationColumnOwner,
        organizationColumnUsers,
        organizationColumnInvites,
        organizationColumnApplications,
        organizationColumnParticipants,
      ],
    });

  const table = useReactTable({
    data: organizations,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDismiss = () => setAction((prev) => undefined);

  const deleteModal = !!action && 'id' in action;
  const removeModal = !!action && 'orgId' in action;

  return (
    <>
      <div className="flex flex-col space-y-4">
        <OrganizationFilterForm
          isPending={isPending}
          clearFilters={clearFilters}
          customSubmit={onSubmit}
          filterValues={filterValues}
          filterForm={organizationFilterFields(isPending)}
        />
        <div className="space-y-2 pb-4">
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
      {deleteModal && (
        <DeleteOrgModal
          open={deleteModal}
          handleDismiss={handleDismiss}
          {...action}
        />
      )}
      {removeModal && (
        <RemoveOrgModal
          open={removeModal}
          handleDismiss={handleDismiss}
          {...action}
        />
      )}
    </>
  );
};

export default OrganizationsTable;
