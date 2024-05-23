import { cn } from "@/lib/utils";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  sectionLabel: string;
  children: React.ReactNode;
}

const SectionWrapper = ({
  sectionLabel,
  children,
  className,
}: SectionWrapperProps) => {
  return (
    <section className={cn("w-full p-10", className)}>
      <h2 className="my-2 text-2xl text-red-600 ">{sectionLabel}</h2>
      {children}
    </section>
  );
};

export default SectionWrapper;
