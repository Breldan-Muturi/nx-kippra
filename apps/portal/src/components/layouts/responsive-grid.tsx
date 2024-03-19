import { cn } from "@/lib/utils";
import React from "react";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ResponsiveGrid = ({ children, className }: ResponsiveGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
