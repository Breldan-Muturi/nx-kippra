import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type ProgramCardProps = React.ComponentPropsWithoutRef<'div'> & {
  id: string;
  imgUrl?: string | null;
  sessions?: number;
  title: string;
};

const ProgramCard = ({
  id,
  imgUrl,
  sessions = 0,
  title,
  className,
  ...props
}: ProgramCardProps) => {
  return (
    <Link
      href={`/${id}`}
      className="rounded-lg hover:ring-2 hover:ring-green-400 focus:ring-2 focus:ring-green-400"
    >
      <Card
        className={cn('flex h-28 flex-row items-center', className)}
        {...props}
      >
        <CardHeader className="w-1/4 p-0 h-28">
          <Image
            src={imgUrl || '/kippra_logo.png'}
            alt={`${title}'s featured image`}
            className="object-cover w-full h-full rounded-l-md"
            width={100}
            height={100}
            quality={100}
          />
        </CardHeader>
        <CardContent className="flex w-[75%] flex-col space-y-2 p-2">
          <CardTitle className="text-green-600">{title}</CardTitle>
          <CardDescription>{sessions} Sessions</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProgramCard;
