'use client';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React, { useMemo, useTransition } from 'react';
import handleTableColumns from '../../components/table/handle-table-columns';
import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import payeeColumn from './columns/payment-column-payee';
import paymentDateColumn from './columns/payment-column-date';
import paymentProgramColumn from './columns/payment-column-program';
import paymentMethodColumn from './columns/payment-column-method';
import {
  FilterPaymentFormType,
  filterPaymentFormSchema,
} from '@/validation/payment.validation';
import TableViews from '../../components/table/table-views';
import { usePathname } from 'next/navigation';
import {
  PaymentTableProps,
  filterPayments,
} from '@/actions/payments/filter.payment.actions';
import { SubmitHandler } from 'react-hook-form';
import PaymentTableFilters from './filters/payment-filters-form';
import { filterPaymentsForm } from './filters/payment-filters-fields';
import TablesPagination from '../../components/table/table-pagination';
import paymentAmountColumn from './columns/payment-column-amount';
import paymentActionsColumn from './columns/payment-column-actions';
import paymentInvoiceColumn from './columns/payment-column-invoice';
import paymentColumnCurrency from './columns/payment-column-currency';
import ReusableTable from '../../components/table/reusable-table';

const PaymentsTable = ({
  paymentsInfo: { payments, count, paymentFilters },
  tableParams,
}: PaymentTableProps) => {
  const { hiddenColumns, page, pageSize } = tableParams;
  const filterValues = filterPaymentFormSchema.parse(tableParams);
  const path = usePathname();
  const pathParams = { path, ...tableParams };
  const [isPending, startTransition] = useTransition();

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
      filterPayments({
        ...pathParams,
        viewPayment: paymentId,
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

  const onSubmit: SubmitHandler<FilterPaymentFormType> = (values) => {
    startTransition(() => {
      filterPayments({
        ...pathParams,
        ...values,
      });
    });
  };

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
    <div className="flex flex-col space-y-4 w-max">
      <PaymentTableFilters
        path={path}
        pageSize={pageSize}
        isPending={isPending}
        customSubmit={onSubmit}
        filterForm={filterPaymentsForm({
          ...paymentFilters,
          disabled: isPending,
        })}
        filterValues={filterValues}
        startTransition={startTransition}
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
  );
};

export default PaymentsTable;
