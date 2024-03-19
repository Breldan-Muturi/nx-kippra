import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  alt: string;
}

export const Hero = ({ image, className, alt, ...props }: HeroProps) => {
  return (
    <div className={cn("relative min-h-[400px] w-full", className)} {...props}>
      <Image
        width={1280}
        height={720}
        src={image}
        alt={alt}
        className="w-full min-h-[400px] object-fit"
        layout="responsive"
      />
    </div>
  );
};
