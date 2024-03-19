import { FileDisplayProps } from "@/types/file.types";
import { FileIcon, X } from "lucide-react";
import React from "react";

const DefaultFileDisplay = ({ value, onChange }: FileDisplayProps) => {
  return (
    <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
      <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
      >
        {value}
      </a>
      <button
        onClick={() => onChange("")}
        className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DefaultFileDisplay;
