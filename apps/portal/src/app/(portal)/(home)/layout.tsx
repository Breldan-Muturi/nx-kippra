import Image from 'next/image';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full">
      <div className="relative min-h-[100px] md:min-h-[160px] w-full">
        <Image
          src="/newhero.jpg"
          alt="KIPPRA hero image"
          priority={true}
          fill
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 flex items-end justify-start px-4 pb-6 bg-gray-900/60">
          <h1 className="text-lg font-bold tracking-wide capitalize whitespace-normal md:text-3xl text-gray-50">
            KIPPRA CAPACITY BUILDING REGISTRATION PORTAL
          </h1>
        </div>
      </div>
      {children}
    </div>
  );
};

export default HomeLayout;
