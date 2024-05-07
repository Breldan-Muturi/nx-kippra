'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AllowedFileTypes,
  FilePreviewSchema,
} from '@/validation/reusable.validation';
import React, {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import FilePreview from './file-preview';

type FileUploaderProps = React.ComponentPropsWithoutRef<'div'> & {
  value?: (File | FilePreviewSchema)[] | undefined;
  onChange: (upload: (File | FilePreviewSchema)[] | undefined) => void;
  placeholder?: string;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<FilePreviewSchema[]>([]);
  const showPreview = !!preview && preview.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) =>
        AllowedFileTypes.includes(file.type),
      );
      if (files.length !== validFiles.length) {
        toast.error('Invalid file type');
      }
      const updatedFiles = value ? [...(value as File[])] : [];
      validFiles.forEach((file) => {
        const existingFileIndex = updatedFiles.findIndex(
          (existingFile) => existingFile.name === file.name,
        );
        if (existingFileIndex !== -1) {
          updatedFiles[existingFileIndex] = file;
        } else {
          updatedFiles.push(file);
        }
      });
      onChange(updatedFiles);
    }

    setDragActive(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length && onChange) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = value ? [...(value as File[])] : [];
      newFiles.forEach((file) => {
        const existingFileIndex = updatedFiles.findIndex(
          (existingFile) => existingFile.name === file.name,
        );
        if (existingFileIndex !== -1) {
          updatedFiles[existingFileIndex] = file;
        } else {
          updatedFiles.push(file);
        }
      });
      onChange(updatedFiles);
    }
  };

  const handleRemove = (name: string) => {
    if (value) {
      const updatedFiles = value.filter((file) => {
        if (file instanceof File) {
          return file.name !== name;
        } else {
          return (file as FilePreviewSchema).fileName !== name;
        }
      });
      onChange(updatedFiles.length > 0 ? updatedFiles : undefined);
    }
  };

  useEffect(() => {
    if (value && value.length > 0) {
      const newFilePreviews = value
        .map((item) => {
          if (item instanceof File) {
            // Handle file object: convert to URL and map to FilePreviewSchema
            return {
              fileName: item.name,
              fileSize: item.size,
              fileType: item.type,
              fileUrl: URL.createObjectURL(item),
            };
          } else if (typeof item === 'object' && 'fileUrl' in item) {
            return item;
          }
          return null;
        })
        .filter((item) => item !== null);

      setPreview(newFilePreviews as FilePreviewSchema[]);

      return () => {
        newFilePreviews.forEach((preview) => {
          if (preview?.fileUrl && preview.fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(preview.fileUrl);
          }
        });
      };
    } else {
      setPreview([]);
    }
  }, [value]);

  // useEffect(() => {
  //   const newFilePreviews = (value || [])
  //     .map((item) => {
  //       if (item instanceof File) {
  //         // Handle file object: convert to URL and map to FilePreviewSchema
  //         return {
  //           fileName: item.name,
  //           fileSize: item.size,
  //           fileType: item.type,
  //           fileUrl: URL.createObjectURL(item),
  //         };
  //       } else if (typeof item === 'object' && 'fileUrl' in item) {
  //         return item;
  //       }
  //       return null;
  //     })
  //     .filter((item) => item !== null);
  //   setPreview(newFilePreviews as FilePreviewSchema[]);
  //   return () => {
  //     newFilePreviews.forEach((preview) => {
  //       if (preview?.fileUrl && preview.fileUrl.startsWith('blob:')) {
  //         URL.revokeObjectURL(preview.fileUrl);
  //       }
  //     });
  //   };
  // }, [value]);

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const fileCount = value?.length || 0;

  return (
    <div className={cn('flex flex-col w-full space-y-2', className)} {...props}>
      <div
        onClick={handleDivClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'p-2 bg-muted-background border border-muted-background rounded-md cursor-pointer',
          dragActive &&
            'bg-white border-2 border-dashed border-muted-foreground',
        )}
      >
        <p className="text-sm text-muted-foreground">
          {fileCount === 0 ? placeholder : `${fileCount} file(s) selected`}
        </p>
      </div>
      {/* This component is the input/drag widget for the user to upload files with */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleChange}
        accept={AllowedFileTypes.join(', ')}
        className="hidden"
      />
      {/* This component renders the input files */}
      {showPreview && (
        <ScrollArea className="h-48">
          <div className="flex flex-col space-y-2">
            {preview.map((file, i) => {
              return (
                <FilePreview
                  key={`${i}${file.fileUrl}`}
                  handleRemove={handleRemove}
                  {...file}
                />
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default FileUploader;
