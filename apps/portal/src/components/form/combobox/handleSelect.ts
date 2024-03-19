import { FieldValues, Path, PathValue } from "react-hook-form";

export const handleOptionSelect = <T extends FieldValues>(
  selectedValue: string,
  value: PathValue<T, Path<T>>,
): PathValue<T, Path<T>> | undefined => {
  if (selectedValue === value) {
    return undefined;
  } else {
    return selectedValue as PathValue<T, Path<T>>;
  }
};
