"use server";
import { withAdminCheck } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgramByCode, getProgramByTitle } from "@/helpers/program.helpers";
import {
  NewProgramForm,
  UpdateProgramForm,
  newProgramSchema,
  updateProgramSchema,
} from "@/validation/program.validation";

export const newProgram = withAdminCheck(
  async (
    values: NewProgramForm,
  ): Promise<{ error?: string; success?: string; programId?: string }> => {
    const validatedFields = newProgramSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };
    const { code, title, prerequisiteCourses, ...programData } =
      validatedFields.data;
    const programTitleExists = await getProgramByTitle(title);
    if (programTitleExists)
      return { error: "A program with this title already exists" };
    const programCodeExists = await getProgramByCode(code);
    if (programCodeExists)
      return { error: "A program with this code already exists" };
    const newProgram = await db.program.create({
      data: {
        code,
        title,
        prerequisites: prerequisiteCourses
          ? {
              connect: prerequisiteCourses.map((id) => ({ id })),
            }
          : undefined,
        ...programData,
      },
    });

    return {
      success: "New program created successfully",
      programId: newProgram.id,
    };
  },
);

export const updateProgram = withAdminCheck(
  async (values: UpdateProgramForm) => {
    const validatedFields = updateProgramSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };
    const { id, title, code, ...otherValues } = validatedFields.data;
    const titleExist = title && (await getProgramByTitle(title));
    const codeExists = code && (await getProgramByCode(code));
    if (titleExist && titleExist.id !== id)
      return { titleExistsError: "A program with this title already exists" };
    if (codeExists && codeExists.id !== id)
      return { codeExistsError: "A program with this code already exists" };

    await db.program.update({
      where: { id },
      data: {
        title,
        code,
        ...otherValues,
      },
    });

    return { success: "Program updated successfully" };
  },
);
