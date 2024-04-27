import { SingleTableApplication } from "@/actions/applications/filter.applications.actions";
import { formatSponsorType } from "@/helpers/enum.helpers";
import { ColumnDef } from "@tanstack/react-table";

const applicationTypeColumn: ColumnDef<SingleTableApplication> = {
  id: "sponsor Type",
  header: "Type",
  cell: ({ row }) => {
    const {
      sponsorType: type,
      slotsCitizen,
      slotsEastAfrican,
      slotsGlobal,
    } = row.original;
    const participantCount = slotsCitizen + slotsEastAfrican + slotsGlobal;
    return (
      <div className="flex min-w-40 flex-col items-start justify-start">
        <p>{formatSponsorType(type)}</p>
        <p className="font-semibold text-green-600">
          {`${participantCount} participants`}
        </p>
      </div>
    );
  },
};

export default applicationTypeColumn;
