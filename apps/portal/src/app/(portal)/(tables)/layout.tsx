import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex justify-center px-6 py-4 overflow-x-hidden">
      {children}
    </main>
  );
};

export default layout;
