import React from 'react';

const ContentArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col flex-1 bg-neutral-100">
      <div className="sticky flex-1 overflow-y-auto">{children}</div>
      <footer className="self-center pt-1 pb-0.5 text-sm font-semibold">
        Copyright @{new Date().getFullYear()} Kenya Institute of Public Policy
        Research and Analysis
      </footer>
    </section>
  );
};

export default ContentArea;
