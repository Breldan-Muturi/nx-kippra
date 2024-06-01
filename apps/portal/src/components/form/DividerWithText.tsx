const DividerWithText = ({ dividerText }: { dividerText: string }) => {
  return (
    <div className="relative flex items-center justify-center w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="px-2 bg-white text-muted-foreground">
          {dividerText}
        </span>
      </div>
    </div>
  );
};

export default DividerWithText;
