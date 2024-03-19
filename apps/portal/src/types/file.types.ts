import { OurFileRouterKeys } from "@/app/api/uploadthing/core";

export type FileDisplayProps = {
  value: string;
  onChange: (url?: string) => void;
};

export type FileUploaderProps = {
  endpoint: OurFileRouterKeys;
  onChange: (url?: string) => void;
};
