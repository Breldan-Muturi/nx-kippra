import React from 'react';
import MobileSliders from './components/MobileSliders';
import Sliders from './components/Sliders';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="grid h-screen grid-cols-3">
      <Sliders
        message="Register for online or on premises courses from KIPPRA"
        className="hidden md:flex md:col-span-1"
      />
      <div className="flex flex-col items-center justify-center px-4 space-y-6 col-span-full md:px-12 lg:px-20 md:col-span-2">
        <div className="grid w-full md:hidden place-items-center">
          <MobileSliders className="flex align-center" />
        </div>
        {children}
      </div>
    </main>
  );
};

export default layout;
