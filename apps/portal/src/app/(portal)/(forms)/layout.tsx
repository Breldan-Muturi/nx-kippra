import React from 'react';

const FormsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex justify-center my-2">{children}</div>;
};

export default FormsLayout;
