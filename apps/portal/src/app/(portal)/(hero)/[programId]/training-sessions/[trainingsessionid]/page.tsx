import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrganizationRole } from "@prisma/client";
import { NextResponse } from "next/server";
import React from "react";
import ApplicationForm from "./components/ApplicationForm";
import { SelectOptions } from "@/types/form-field.types";
// import { env } from "process";
import { ParticipantSelectOption } from "@/validation/application.validation";

interface ApplicationPageProps {
  params: {
    programId: string;
    trainingsessionid: string;
  };
}

const ApplicationPage = async ({
  params: { trainingsessionid },
}: ApplicationPageProps) => {
  const userId = await currentUserId();

  if (!userId)
    return NextResponse.rewrite(
      new URL("/account/error", process.env.NEXT_PUBLIC_APP_URL),
    );

  const trainingSessionApplicationDataPromise = db.trainingSession.findUnique({
    where: { id: trainingsessionid },
    include: {
      program: {
        select: {
          title: true,
          prerequisites: {
            select: {
              title: true,
              id: true,
            },
          },
        },
      },
    },
  });

  const userOwnedOrganizationsPromise = db.organization.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const userOwnedOrganizationParticipantsPromise = db.user.findMany({
    where: {
      organizations: {
        some: {
          organization: {
            users: {
              some: {
                userId,
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      citizenship: true,
      nationalId: true,
    },
  });

  const [
    trainingSessionApplicationData,
    userOwnedOrganizations,
    userOwnedOrganizationParticipants,
  ] = await Promise.all([
    trainingSessionApplicationDataPromise,
    userOwnedOrganizationsPromise,
    userOwnedOrganizationParticipantsPromise,
  ]);

  if (!trainingSessionApplicationData)
    return NextResponse.rewrite(
      new URL("/account/error", process.env.NEXT_PUBLIC_APP_URL),
    );

  const organizationOptions: SelectOptions[] = userOwnedOrganizations.map(
    (org) => ({
      value: org.id,
      optionLabel: org.name,
    }),
  );

  const participantSearchOptions: ParticipantSelectOption[] =
    userOwnedOrganizationParticipants.map(
      ({ id, citizenship, email, image, name, nationalId }) => ({
        userId: id,
        name: name ?? undefined,
        email: email ?? undefined,
        image: image ?? undefined,
        organizationId: organizationOptions[0].value,
        organizationName: organizationOptions[0].optionLabel,
        citizenship,
        nationalId: nationalId ?? undefined,
      }),
    );

  return (
    <ApplicationForm
      organizationOptions={organizationOptions}
      trainingSessionData={trainingSessionApplicationData}
      participantSearchOptions={participantSearchOptions}
    />
  );
};

export default ApplicationPage;
