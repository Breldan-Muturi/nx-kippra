import {cn} from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  imageAlt?: string;
}

const Sliders: React.FC<SliderProps> = ({message, className}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-10 bg-green-600 p-4",
        className
      )}
    >
      <Image
        src="/KIPPRA-logo.png"
        alt="KIPPRA Logo"
        width={400}
        height={200}
      />
      <p className="font-bold text-center text-white">{message}</p>
    </div>
  );
};

export default Sliders;
