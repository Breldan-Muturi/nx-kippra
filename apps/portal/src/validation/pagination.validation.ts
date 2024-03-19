import { z } from "zod";

export const paginationSchema = z.object({
  page: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message:
        "Page must be a string representing a number greater than or equal to 1",
    })
    .default("1"),
  pageSize: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 10, {
      message:
        "PageSize must be a string representing a number greater than or equal to 10",
    })
    .default("10"),
});

export type PaginationType = z.infer<typeof paginationSchema>;
