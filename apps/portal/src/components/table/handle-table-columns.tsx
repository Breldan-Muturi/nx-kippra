import { ColumnDef } from "@tanstack/react-table";

interface HandleTableColumnProps<T extends object> {
  hiddenColumnsArray?: string[];
  columns: ColumnDef<T>[];
}

const handleTableColumns = <T extends object>({
  hiddenColumnsArray,
  columns,
}: HandleTableColumnProps<T>): {
  visibleColumns: ColumnDef<T>[];
  allColumnIds: string[];
} => {
  const allColumnIds = columns.reduce<string[]>((acc, column) => {
    if (column.id && column.enableHiding !== false) {
      acc.push(column.id);
    }
    return acc;
  }, []);

  if (hiddenColumnsArray && hiddenColumnsArray.length) {
    return {
      allColumnIds,
      visibleColumns: columns.filter(
        ({ id }) => id !== undefined && !hiddenColumnsArray?.includes(id),
      ),
    };
  } else {
    return { allColumnIds, visibleColumns: columns };
  }
};

export default handleTableColumns;
