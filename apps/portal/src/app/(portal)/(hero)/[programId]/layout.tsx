import React from 'react';
import DescriptionTabs from './components/DescriptionTabs';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

interface ProgramLayoutProps {
  children: React.ReactNode;
  params: { programId: string };
}

const ProgramLayout = async ({
  children,
  params: { programId },
}: ProgramLayoutProps) => {
  const program = await db.program.findUnique({
    where: { id: programId },
    select: {
      title: true,
      imgUrl: true,
    },
  });

  if (!program)
    return NextResponse.rewrite(
      new URL('/account/error', process.env.NEXT_PUBLIC_APP_URL),
    );

  return (
    <div className="w-full p-0">
      <DescriptionTabs programId={programId} />
      <div className="flex justify-center px-4 py-2">{children}</div>
    </div>
  );
};

export default ProgramLayout;
