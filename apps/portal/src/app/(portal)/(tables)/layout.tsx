import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center overflow-x-hidden px-6 py-4">
      {children}
    </div>
  );
};

export default layout;
