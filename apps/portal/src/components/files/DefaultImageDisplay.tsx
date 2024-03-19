import { FileDisplayProps } from "@/types/file.types";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";

const DefaultImageDisplay = ({ value, onChange }: FileDisplayProps) => {
  return (
    <div className="relative h-20 w-20">
      <Image fill src={value} alt="Upload" className="rounded-full" />
      <button
        onClick={() => onChange("")}
        className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-white shadow-sm"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DefaultImageDisplay;
