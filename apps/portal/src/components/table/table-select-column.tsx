import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

const tableSelectColumn = <T extends object>(
  isPending: boolean,
): ColumnDef<T> => {
  return {
    id: "select",
    header: ({
      table: {
        getIsAllPageRowsSelected,
        getIsSomePageRowsSelected,
        toggleAllPageRowsSelected,
      },
    }) => (
      <Checkbox
        checked={
          getIsAllPageRowsSelected() ||
          (getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="m-2 mr-4 translate-y-[2px]"
        disabled={isPending}
      />
    ),
    cell: ({ row: { getIsSelected, toggleSelected } }) => (
      <Checkbox
        checked={getIsSelected()}
        onCheckedChange={(value) => toggleSelected(!!value)}
        aria-label="Select row"
        className="m-2 mr-4 translate-y-[2px]"
        disabled={isPending}
      />
    ),
    enableHiding: false,
  };
};

export default tableSelectColumn;
