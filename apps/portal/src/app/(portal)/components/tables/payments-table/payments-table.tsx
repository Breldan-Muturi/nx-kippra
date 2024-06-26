'use client';
import {
  PaymentTableProps,
  SinglePaymentDetail,
  filterPayments,
} from '@/actions/payments/filter.payment.actions';
import {
  PaymentDetailsType,
  getSinglePayment,
} from '@/actions/payments/single.payment.actions';
import { cn } from '@/lib/utils';
import {
  FilterPaymentsType,
  filterPaymentsSchema,
  pathPaymentsSchema,
} from '@/validation/payment/payment.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState, useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import handleTableColumns from '../../../../../components/table/handle-table-columns';
import ReusableTable from '../../../../../components/table/reusable-table';
import TablesPagination from '../../../../../components/table/table-pagination';
import TableViews from '../../../../../components/table/table-views';
import paymentActionsColumn from './columns/payment-column-actions';
import paymentAmountColumn from './columns/payment-column-amount';
import paymentColumnCurrency from './columns/payment-column-currency';
import paymentDateColumn from './columns/payment-column-date';
import paymentInvoiceColumn from './columns/payment-column-invoice';
import paymentMethodColumn from './columns/payment-column-method';
import payeeColumn from './columns/payment-column-payee';
import paymentProgramColumn from './columns/payment-column-program';
import { filterPaymentsForm } from './filters/payment-filters-fields';
import PaymentTableFilters from './filters/payment-filters-form';
import PaymentSheetView from './sheets/payment-sheet-view';

type TablePaymentProps = React.ComponentPropsWithoutRef<'div'> &
  PaymentTableProps;
const PaymentsTable = ({
  payments,
  filterChannels,
  filterStatuses,
  count,
  fetchParams,
  className,
  ...props
}: TablePaymentProps) => {
  const { hiddenColumns, page, pageSize } = fetchParams;
  const filterValues = filterPaymentsSchema.parse(fetchParams);
  const path = usePathname();
  const pathParams = pathPaymentsSchema.parse({
    path,
    ...fetchParams,
  });
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<PaymentDetailsType | undefined>();

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterPayments({
        ...pathParams,
        hiddenColumns: hideColumns,
      });
    });
  };

  const viewPayment = (paymentId: string) => {
    startTransition(() => {
      getSinglePayment(paymentId).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          setModal((prev) => data.paymentDetails);
        }
      });
    });
  };

  const viewReceipt = (filePath: string) => {
    startTransition(() => {
      window.open(filePath, '_blank');
    });
  };

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterPayments({
        ...pathParams,
        page: pageInt.toString(),
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterPayments({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterPaymentsType> = (values) => {
    startTransition(() => {
      filterPayments({
        ...pathParams,
        ...values,
      });
    });
  };

  const clearFilters = () =>
    startTransition(() => {
      filterPayments({
        path,
        page: '1',
        pageSize,
      });
    });

  const handleDismiss = () => setModal((prev) => undefined);

  const hiddenColumnsArray = useMemo(
    () => (hiddenColumns ? hiddenColumns.split(',') : []),
    [hiddenColumns],
  );

  const { visibleColumns, allColumnIds } =
    handleTableColumns<SinglePaymentDetail>({
      hiddenColumnsArray,
      columns: [
        payeeColumn,
        paymentActionsColumn({
          isPending,
          viewPayment,
          viewReceipt,
        }),
        paymentInvoiceColumn,
        paymentDateColumn,
        paymentColumnCurrency,
        paymentAmountColumn,
        paymentMethodColumn,
        paymentProgramColumn,
      ],
    });

  const table = useReactTable({
    data: payments,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className={cn('flex flex-col space-y-4', className)} {...props}>
        <PaymentTableFilters
          isPending={isPending}
          customSubmit={onSubmit}
          filterForm={filterPaymentsForm({
            filterChannels,
            filterStatuses,
            disabled: isPending,
          })}
          filterValues={filterValues}
          clearFilters={clearFilters}
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
      {!!modal && (
        <PaymentSheetView
          paymentDetails={modal}
          handleDismiss={handleDismiss}
        />
      )}
    </>
  );
};

export default PaymentsTable;
