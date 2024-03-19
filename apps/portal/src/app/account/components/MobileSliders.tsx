import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  imageAlt?: string;
}

const MobileSliders: React.FC<SliderProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center",
        className
      )}
    >
      <Image
        src="/KIPPRA-logo.png"
        alt="KIPPRA Logo"
        width={400}
        height={200}
      />
    </div>
  );
};

export default MobileSliders;
