"use server";

import { db } from "@/lib/db";
import React from "react";

interface ProgramPageProps {
  params: { programId: string };
}

const ProgramPage = async ({ params: { programId } }: ProgramPageProps) => {
  const programSummary = await db.program.findUnique({
    where: { id: programId },
    select: { summary: true },
  });

  let summary: string = "";

  if (programSummary === null || programSummary.summary === null) {
    summary = "This program's summary is not yet uploaded";
  } else {
    summary = programSummary.summary;
  }
  return <div className="justify-center mt-4">{summary}</div>;
};

export default ProgramPage;
