import React from "react";
import Sliders from "./components/Sliders";
import MobileSliders from "./components/MobileSliders";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="grid grid-cols-3 h-screen">
      <Sliders
        message="Register for online or on premises courses from KIPPRA"
        className="hidden md:flex md:col-span-1"
      />
      <div className="flex flex-col col-span-3 md:col-span-2 p-20 items-center justify-center space-y-6">
        <div className="w-full grid place-items-center">
          <MobileSliders
            className="flex align-center w-1/2"
          />
        </div>
        {children}
      </div>
    </main>
  );
};

export default layout;
