"use client";

import { FileUploadFieldType } from "@/types/form-field.types";
import React from "react";
import ComposableField from "./ComposableField";
import { FormControl } from "@/components/ui/form";
import { FieldValues } from "react-hook-form";
import DefaultFileUploader from "../files/DefaultFileUploader";
import DefaultImageDisplay from "../files/DefaultImageDisplay";
import DefaultFileDisplay from "../files/DefaultFileDisplay";

interface FileUploadFieldProps<T extends FieldValues>
  extends FileUploadFieldType<T> {}

const FileUploadField = <T extends FieldValues>({
  ...fileUploadField
}: FileUploadFieldProps<T>) => {
  const { endpoint, fileUploadComponent, fileDisplayComponent } =
    fileUploadField;
  return (
    <ComposableField {...fileUploadField}>
      {({ field: { value, onChange } }) => {
        const fileDisplay = { value, onChange };
        const fileUpload = { endpoint, onChange };
        const isPDF = value && value?.split(".").pop() === "pdf";

        const renderFileDisplay = () => {
          if (fileDisplayComponent) {
            return fileDisplayComponent(fileDisplay);
          } else if (isPDF) {
            return <DefaultFileDisplay {...fileDisplay} />;
          } else {
            return <DefaultImageDisplay {...fileDisplay} />;
          }
        };

        const renderFileUploader = () => {
          if (fileUploadComponent) {
            return fileUploadComponent(fileUpload);
          } else {
            return <DefaultFileUploader {...fileUpload} />;
          }
        };
        return (
          <FormControl>
            {value ? renderFileDisplay() : renderFileUploader()}
          </FormControl>
        );
      }}
    </ComposableField>
  );
};

export default FileUploadField;
