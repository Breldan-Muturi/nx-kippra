import { validateInvite } from '@/actions/invites/validate.invites.actions';
import React from 'react';
import FormRegister from './components/register-form';

const RegisterPage = async ({
  searchParams: { token },
}: {
  searchParams: { token: string };
}) => {
  const invite = !!token ? await validateInvite(token) : undefined;
  return <FormRegister validInvite={invite} />;
};

export default RegisterPage;
