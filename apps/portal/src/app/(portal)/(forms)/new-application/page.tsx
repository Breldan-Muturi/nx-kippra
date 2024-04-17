import { db } from '@/lib/db';
import { SelectOptions } from '@/types/form-field.types';
import React from 'react';
import NewApplicationForm from './components/new-application-form';

const NewApplicationPage = async () => {
  const [programs, organizations] = await Promise.all([
    db.program.findMany({
      where: { trainingSessions: { some: { endDate: { gte: new Date() } } } },
      select: { id: true, title: true },
    }),
    db.organization.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const programOptions: SelectOptions[] = programs.map(({ id, title }) => ({
    value: id,
    optionLabel: title,
  }));
  const organizationOptions: SelectOptions[] = organizations.map(
    ({ id, name }) => ({ value: id, optionLabel: name }),
  );

  return (
    <NewApplicationForm
      programOptions={programOptions}
      organizationOptions={organizationOptions}
    />
  );
};

export default NewApplicationPage;
