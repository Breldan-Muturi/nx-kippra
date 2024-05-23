import TooltipIconButton from '@/components/buttons/tooltip-icon-button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatFileSize, truncateStrings } from '@/lib/utils';
import { ActionTriggerType } from '@/types/actions.types';
import { FilePreviewSchema } from '@/validation/reusable.validation';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type FilePreviewProps = React.ComponentPropsWithoutRef<'div'> &
  FilePreviewSchema & {
    handleRemove: ActionTriggerType;
  };

const FilePreview = ({
  fileName,
  fileSize,
  fileType,
  fileUrl,
  handleRemove,
  filePath,
  className,
  ...props
}: FilePreviewProps) => {
  const src = fileType === 'application/pdf' ? '/pdf-icon.png' : fileUrl;
  const truncatedFileName = truncateStrings(fileName, 28);
  const formattedFileSize = formatFileSize(fileSize);
  return (
    <div
      className={cn(
        'flex items-center space-x-4 p-2 border rounded-lg',
        className,
      )}
      {...props}
    >
      <div className="relative size-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={src}
                alt="Preview"
                layout="fill"
                objectFit="cover"
                className="transition-all duration-300 rounded-md hover:scale-105"
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Open the preview in a separate tab</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex-col items-start justify-center flex-grow">
        <p className="text-base truncate">{truncatedFileName}</p>
        <p className="text-xs">
          <span>{formattedFileSize}</span>{' '}
          <span className="font-medium text-red-600">{fileType}</span>
        </p>
      </div>
      <TooltipIconButton
        icon={<Trash2 className="size-4" />}
        tooltipLabel="Remove file"
        title="Remove file"
        className="bg-red-600/80 hover:bg-red-600 size-6"
        onClick={() => handleRemove(fileName)}
      />
    </div>
  );
};

export default FilePreview;
