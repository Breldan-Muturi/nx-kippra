'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AllowedImageTypes } from '@/validation/reusable.validation';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Input } from '../../ui/input';

type ImageUploaderProps = React.ComponentPropsWithRef<'div'> & {
  value?: File | string | null;
  onChange: (file: File | null) => void;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // Reset the preview when the value is cleared
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
    } else {
      const fileUrl = URL.createObjectURL(value);
      setPreview(fileUrl);
      // Cleanup function revokes the URL to avoid memory leaks
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length && onChange) {
      onChange(event.target.files[0]);
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className={cn(className)} {...props}>
      {preview ? (
        <div className="relative w-1/3 overflow-hidden rounded-md">
          <div className="overflow-hidden transition-colors duration-300 border-2 border-gray-300 rounded-md hover:border-green-600">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={preview} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={400}
                    height={400}
                    className="object-cover transition-all duration-300 rounded-md hover:scale-105"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Open the preview in another tab</TooltipContent>
            </Tooltip>
          </div>
          <button
            onClick={handleClear}
            className="absolute p-1 text-white rounded-full shadow-sm top-1 left-1 bg-rose-500"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Input
          type="file"
          onChange={handleChange}
          accept={AllowedImageTypes.join(', ')}
        />
      )}
    </div>
  );
};

export default ImageUploader;
