import React from "react";

const DividerWithText = ({dividerText}: {dividerText: string}) => {
  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-muted-foreground">
          {dividerText}
        </span>
      </div>
    </div>
  );
};

export default DividerWithText;
