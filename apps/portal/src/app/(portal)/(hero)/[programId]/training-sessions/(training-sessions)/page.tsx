"use server";

import TrainingSessionCard from "@/app/(portal)/components/training-session";
import ResponsiveGrid from "@/components/layouts/responsive-grid";
import { buttonVariants } from "@/components/ui/button";
import { currentRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import React from "react";
import AddSession from "./components/add-session";
import UpdateSession from "./components/update-session";
import DeleteSession from "./components/delete-session";
import { Pencil, Trash2 } from "lucide-react";

const page = async ({
  params: { programId },
  searchParams: { updateSession, deleteSession, newSession },
}: {
  params: { programId: string };
  searchParams: {
    updateSession: string;
    deleteSession: string;
    newSession: boolean;
  };
}) => {
  const userRolePromise = currentRole();

  const programTitlePromise = db.program.findUnique({
    where: { id: programId },
    select: {
      title: true,
    },
  });

  const programTrainingSessionsPromise = db.trainingSession.findMany({
    where: { programId },
    orderBy: { startDate: "asc" },
  });

  const [programTitle, programTrainingSessions, role] = await Promise.all([
    programTitlePromise,
    programTrainingSessionsPromise,
    userRolePromise,
  ]);

  const isAdmin = role === UserRole.ADMIN;
  const updateThisSession = programTrainingSessions.find(
    ({ id }) => id === updateSession,
  );
  const deleteThisSession = programTrainingSessions.find(
    ({ id }) => id === deleteSession,
  );

  return (
    <>
      <ResponsiveGrid>
        {isAdmin && (
          <div className="col-span-3 flex justify-center">
            <Link
              href={{
                pathname: `/${programId}/training-sessions/`,
                query: { newSession: true },
              }}
              className={cn(
                buttonVariants({ variant: "link" }),
                "text-center text-xl font-bold",
              )}
            >
              📅 Add a new Training Session
            </Link>
          </div>
        )}
        {programTrainingSessions.map((trainingSession, i) => (
          <div
            key={`${i}-${trainingSession.id}`}
            className="col-span-1 flex flex-col space-y-2"
          >
            <TrainingSessionCard
              title={programTitle?.title ?? "Unnamed program"}
              trainingSession={trainingSession}
              className="flex-grow"
            />
            {isAdmin && (
              <div className="flex justify-end space-x-2">
                <Link
                  href={{
                    pathname: `/${programId}/training-sessions/`,
                    query: { updateSession: trainingSession.id },
                  }}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "icon",
                    }),
                    "h-6 w-6 rounded-full bg-green-600/80 hover:bg-green-600",
                  )}
                >
                  <Pencil className="h-4 w-4" color="white" />
                </Link>
                <Link
                  href={{
                    pathname: `/${programId}/training-sessions/`,
                    query: { deleteSession: trainingSession.id },
                  }}
                  className={cn(
                    buttonVariants({
                      variant: "destructive",
                      size: "icon",
                    }),
                    "h-6 w-6 rounded-full",
                  )}
                >
                  <Trash2 className="h-4 w-4" color="white" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </ResponsiveGrid>
      {isAdmin && newSession && <AddSession programId={programId} />}
      {isAdmin && updateThisSession && <UpdateSession />}
      {isAdmin && deleteThisSession && (
        <DeleteSession trainingSession={deleteThisSession} />
      )}
    </>
  );
};

export default page;
