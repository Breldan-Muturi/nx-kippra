import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatDeliveryMode, formatVenues } from "@/helpers/enum.helpers";
import { currentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Citizenship, TrainingSession, UserRole } from "@prisma/client";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type TrainingSessionProps = React.ComponentPropsWithoutRef<"div"> & {
  trainingSession: TrainingSession;
  title: string;
};

const TrainingSessionCard = async ({
  trainingSession: {
    citizenFee,
    citizenOnlineFee,
    eastAfricaFee,
    eastAfricaOnlineFee,
    globalParticipantFee,
    globalParticipantOnlineFee,
    onlineSlots,
    onlineSlotsTaken,
    endDate,
    onPremiseSlots,
    onPremiseSlotsTaken,
    startDate,
    venue,
    mode,
    programId,
    id,
  },
  title,
  className,
}: TrainingSessionProps) => {
  const user = await currentUser();
  const isAdmin = user?.role === UserRole.ADMIN;
  const date = `${format(startDate, "PPP")} to ${format(endDate, "PPP")}`;
  const viewsEastAfrica =
    user?.citizenship === Citizenship.EAST_AFRICAN || isAdmin;
  const viewsGlobal = user?.citizenship === Citizenship.GLOBAL || isAdmin;
  const viewsCitizen = () => {
    if (isAdmin || user?.citizenship === Citizenship.KENYAN) {
      return true;
    } else if (
      !eastAfricaFee &&
      !eastAfricaOnlineFee &&
      !globalParticipantFee &&
      !globalParticipantOnlineFee
    ) {
      return true;
    }
    return false;
  };
  return (
    <Card className={cn("flex flex-col rounded-none", className)}>
      <CardHeader className="h-18 font-semibold text-green-600 ">
        <h3>{date}</h3>
      </CardHeader>
      <hr />
      <CardContent className="flex-grow space-y-2">
        <h4 className="mt-4 font-semibold">{title}</h4>
        <ul
          className="list-none space-y-2"
          aria-label="Training session information"
        >
          {venue && (
            <li>
              Venue: <strong>{formatVenues(venue)}</strong>
            </li>
          )}
          <li>
            Delivery: <strong>{formatDeliveryMode(mode)}</strong>
          </li>
          {citizenFee && viewsCitizen() && (
            <li>
              On Premises Fee:{" "}
              <strong>Ksh {citizenFee.toLocaleString("en-US")}</strong>
            </li>
          )}
          {citizenOnlineFee && viewsCitizen() && (
            <li>
              Online Fee:{" "}
              <strong>Ksh {citizenOnlineFee.toLocaleString("en-US")}</strong>
            </li>
          )}
          {eastAfricaFee && viewsEastAfrica && (
            <li>
              On Premises East Africa:{" "}
              <strong>Ksh {eastAfricaFee.toLocaleString("en-US")}</strong>
            </li>
          )}
          {eastAfricaOnlineFee && viewsEastAfrica && (
            <li>
              Online East Africa:{" "}
              <strong>Ksh {eastAfricaOnlineFee.toLocaleString("en-US")}</strong>
            </li>
          )}
          {globalParticipantFee && viewsGlobal && (
            <li>
              On Premises Global:{" "}
              <strong>
                Ksh {globalParticipantFee.toLocaleString("en-US")}
              </strong>
            </li>
          )}
          {globalParticipantOnlineFee && viewsGlobal && (
            <li>
              Online Global:{" "}
              <strong>
                Ksh {globalParticipantOnlineFee.toLocaleString("en-US")}
              </strong>
            </li>
          )}
          {onPremiseSlots && (
            <li>
              On Premises Slots:{" "}
              <strong>
                {onPremiseSlotsTaken ?? 0}/{onPremiseSlots}
              </strong>
            </li>
          )}
          {onlineSlots && (
            <li>
              Online Slots:{" "}
              <strong>
                {onlineSlotsTaken ?? 0}/{onlineSlots}
              </strong>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="p-0">
        <Link
          href={`/${programId}/training-sessions/${id}`}
          title={`Apply for ${title}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mt-auto h-full w-full justify-between rounded-none bg-green-600 p-6 text-white hover:bg-green-800 hover:text-white",
          )}
        >
          <h4>Apply for session</h4>
          <ChevronRight />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TrainingSessionCard;
