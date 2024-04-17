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

interface ProgramCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  imgUrl?: string | null;
  sessions?: number;
  title: string;
}

const ProgramCard = ({
  id,
  imgUrl,
  sessions = 0,
  title,
  className,
}: ProgramCardProps) => {
  return (
    <Link
      href={`/${id}`}
      className="rounded-lg hover:ring-2 hover:ring-green-400 focus:ring-2 focus:ring-green-400"
    >
      <Card className={cn('flex h-28 flex-row items-center', className)}>
        <CardHeader className="h-28 w-1/4 p-0">
          <Image
            src={imgUrl || '/static/images/kippra_logo.png'}
            alt={`${title}'s featured image`}
            className="h-full w-full rounded-l-md object-cover"
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
