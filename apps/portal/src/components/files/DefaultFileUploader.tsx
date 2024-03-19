import { UploadDropzone } from "@/lib/uploadthing";
import { FileUploaderProps } from "@/types/file.types";

import React from "react";
import { toast } from "sonner";

const DefaultFileUploader = ({ endpoint, onChange }: FileUploaderProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error) => {
        const { message } = error;
        toast.error(message);
      }}
    />
  );
};

export default DefaultFileUploader;
