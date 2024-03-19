import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDeliveryMode, formatSponsorType } from "@/helpers/enum.helpers";
import { ValidatedApplicationForm } from "@/validation/application.validation";
import { MessageSquareWarning } from "lucide-react";
import React from "react";

const ApplicationConfirmationDialog: React.FC<ValidatedApplicationForm> = ({
  delivery,
  sponsorType,
  trainingFee,
  newOrganization,
  slotsCitizen,
  slotsEastAfrican,
  slotsGlobal,
}) => {
  const totalSlots =
    (slotsCitizen ?? 0) + (slotsEastAfrican ?? 0) + (slotsGlobal ?? 0);
  const applicationDetails = [
    { key: "Delivery", value: formatDeliveryMode(delivery) },
    { key: "Sponsor", value: formatSponsorType(sponsorType) },
    {
      key: "Application Fee",
      value: `Ksh ${trainingFee.toLocaleString("en-US")}`,
    },
    {
      key: "No of Participants",
      value: `${totalSlots} slot${totalSlots > 1 ? "s" : ""}`,
    },
  ];
  const filteredDetails = applicationDetails.filter(
    ({ value }) => value !== null,
  );
  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <ol>
        {filteredDetails.map(({ key, value }, i) => (
          <li key={`${i}-${key}`}>
            {key}: {value}
          </li>
        ))}
      </ol>
      {newOrganization && (
        <Card className="rounded-sm shadow-none">
          <CardHeader className="flex-row justify-start space-x-2 p-2">
            <MessageSquareWarning
              color="red"
              fill="red"
              fillOpacity={0.3}
              size={36}
            />
            <CardTitle>Creating a new Organization</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <CardDescription>
              By submitting this application, you confirm that you are
              authorized to create this organization on the portal, and to make
              applications on its behalf.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationConfirmationDialog;
