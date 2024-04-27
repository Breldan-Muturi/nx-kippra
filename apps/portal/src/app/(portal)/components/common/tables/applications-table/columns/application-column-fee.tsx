import { SingleTableApplication } from "@/actions/applications/filter.applications.actions";
import { ColumnDef } from "@tanstack/react-table";

const applicationFeeColumn: ColumnDef<SingleTableApplication> = {
  id: "fee",
  header: "Fee",
  cell: ({ row }) => (
    <div className="flex min-w-28">
      Ksh {row.original.applicationFee.toLocaleString("en-US")}
    </div>
  ),
};

export default applicationFeeColumn;
