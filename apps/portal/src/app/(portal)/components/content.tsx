import Link from 'next/link';
import React from 'react';

const ContentArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col flex-1 bg-neutral-100">
      <div className="sticky flex-1 overflow-y-auto">{children}</div>
      <footer className="flex self-center justify-between pt-1 pb-0.5 px-4 w-full">
        <p className="text-sm font-medium">
          Copyright @{new Date().getFullYear()} Kenya Institute of Public Policy
          Research and Analysis
        </p>
        <div className="flex items-center text-xs space-x-1 text-muted-foreground">
          <p>Developed by</p>
          <Link
            href="https://sohnandsol.com"
            title="Open Sohn and Sol Technologies Limited website"
          >
            Sohn and Sol Technologies Limited
          </Link>
        </div>
      </footer>
    </section>
  );
};

export default ContentArea;
