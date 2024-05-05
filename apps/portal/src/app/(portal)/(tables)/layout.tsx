import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center px-6 py-4 overflow-x-hidden">
      {children}
    </div>
  );
};

export default layout;
