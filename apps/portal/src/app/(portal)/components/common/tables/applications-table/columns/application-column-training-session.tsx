import { SingleTableApplication } from "@/actions/applications/filter.applications.actions";
import { Badge } from "@/components/ui/badge";
import { formatDeliveryMode, formatVenues } from "@/helpers/enum.helpers";
import { cn } from "@/lib/utils";
import { Delivery } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

const applicationTrainingSessionColumn: ColumnDef<SingleTableApplication> = {
  id: "training Session",
  header: "Schedule",
  cell: ({ row }) => {
    if (!row.original.trainingSession) {
      return "Training session not available";
    }
    const delivery = row.original.delivery;
    const { startDate, endDate, venue } = row.original.trainingSession;
    return (
      <div className="flex flex-col flex-grow min-w-40 space-y-1">
        <p>
          <span className="font-semibold">{format(startDate, "PPP")}</span> to{" "}
          <span className="font-semibold">{format(endDate, "PPP")}</span>
        </p>
        <div className="flex flex-row items-center space-x-2">
          <Badge
            variant="default"
            className={cn(
              delivery === Delivery.ON_PREMISE ? "bg-green-600" : "",
            )}
          >
            {formatDeliveryMode(delivery)}
          </Badge>
          {venue && <Badge variant="default">{formatVenues(venue)}</Badge>}
        </div>
      </div>
    );
  },
};

export default applicationTrainingSessionColumn;
