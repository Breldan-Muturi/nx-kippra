import React from "react";
import Sliders from "./components/Sliders";
import MobileSliders from "./components/MobileSliders";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-screen grid grid-cols-3">
      <Sliders
        message="Register for online or on premises courses from KIPPRA"
        className="hidden md:flex md:col-span-1"
      />
      <div className="flex flex-col items-center justify-center p-20 col-span-3 md:col-span-2 space-y-6">
        <div className="w-full grid place-items-center">
          <MobileSliders
            className="flex w-1/2 align-center"
          />
        </div>
        {children}
      </div>
    </main>
  );
};

export default layout;
