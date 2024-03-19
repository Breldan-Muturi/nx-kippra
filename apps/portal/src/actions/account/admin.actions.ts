"use server";

export const admin = (values: any): string => {
  console.log(values);
  return "This is the admin action";
};
