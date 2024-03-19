"use client";
import React from "react";
import { Search } from "lucide-react";
import { SearchFieldType } from "@/types/form-field.types";
import ComposableField from "./ComposableField";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldValues } from "react-hook-form";

interface SearchFieldProps<T extends FieldValues> extends SearchFieldType<T> {}

const SearchField = <T extends FieldValues>({
  ...searchField
}: SearchFieldProps<T>) => {
  const { type, placeholder } = searchField;
  return (
    <ComposableField {...searchField}>
      {({ field }) => (
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-0 ml-2 h-4 w-4" />
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className="pl-8"
              {...field}
            />
          </FormControl>
        </div>
      )}
    </ComposableField>
  );
};

export default SearchField;
