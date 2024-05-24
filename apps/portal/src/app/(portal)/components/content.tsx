import Link from 'next/link';
import React from 'react';

const ContentArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col flex-1 bg-neutral-100">
      <div className="sticky flex-1 overflow-y-auto">{children}</div>
      <footer className="flex flex-col lg:flex-row space-y-1 self-center items-center justify-between pt-1 pb-0.5 px-2 lg:px-4 w-full">
        <p className="w-full text-sm font-medium text-center break-words lg:w-auto">
          Copyright @{new Date().getFullYear()} Kenya Institute of Public Policy
          Research and Analysis
        </p>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
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
