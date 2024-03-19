import { db } from "@/lib/db";
import { SelectOptions } from "@/types/form-field.types";
import { Program } from "@prisma/client";

export const getProgramByTitle = async (title: Program["title"]) => {
  try {
    const program = await db.program.findUnique({
      where: { title },
    });
    return program;
  } catch {
    return null;
  }
};

export const getProgramByCode = async (code: Program["code"]) => {
  try {
    const program = await db.program.findUnique({ where: { code } });
    return program;
  } catch {
    return null;
  }
};

export const getProgramById = async (id: Program["id"]) => {
  try {
    const program = await db.program.findUnique({ where: { id } });
    return program;
  } catch {
    return null;
  }
};

export const getProgramPrerequisiteOptions = async (
  id?: Program["id"],
): Promise<SelectOptions[] | undefined> => {
  try {
    const programsDb = await db.program.findMany({
      where: {
        id: {
          not: id ?? undefined, // ensures the same program is not included in the prerequisite options
        },
        requiredFor: {
          none: {
            id: id, // excludes program where the given id is a prerequisite
          },
        },
      },
      select: {
        id: true,
        title: true,
      },
    });
    return programsDb.map(({ id, title }) => ({
      value: id,
      optionLabel: title,
    }));
  } catch {
    return undefined;
  }
};
