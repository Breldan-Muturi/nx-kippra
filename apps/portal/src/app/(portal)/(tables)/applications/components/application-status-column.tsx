import { SingleTableApplication } from "@/actions/applications/filter.applications.actions";
import { Badge } from "@/components/ui/badge";
import { formatStatus } from "@/helpers/enum.helpers";
import { ApplicationStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

const applicationStatusColumn: ColumnDef<SingleTableApplication> = {
  id: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.original.status;
    const formattedStatus = formatStatus(status);
    switch (status) {
      case ApplicationStatus.PENDING:
        return <Badge variant="outline">{formattedStatus}</Badge>;
      case ApplicationStatus.APPROVED:
        return (
          <Badge
            variant="secondary"
            className="border-green-600 text-green-600"
          >
            {formattedStatus}
          </Badge>
        );
      case ApplicationStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-green-600">
            {formattedStatus}
          </Badge>
        );
      default:
        return null;
    }
  },
  enableHiding: false,
};

export default applicationStatusColumn;
