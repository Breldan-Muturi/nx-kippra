'use server';
import { redirect } from 'next/navigation';
import { ZodSchema } from 'zod';

export default async function filterRedirect<T extends ZodSchema>(
  value: T['_output'],
  schema: T,
  path: string,
) {
  const validFilter = schema.safeParse(value);
  if (!validFilter.success) return { error: 'Invalid fields' };
  const searchParams = new URLSearchParams();
  Object.entries(validFilter.data).forEach(([key, value]) => {
    if (value && key !== 'path') {
      searchParams.append(key, String(value));
    }
  });
  redirect(`${path}?${searchParams.toString()}`);
}
