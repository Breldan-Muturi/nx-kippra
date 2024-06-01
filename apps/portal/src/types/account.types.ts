import { RegisterForm } from '@/validation/account/account.validation';
import { BuiltInProviderType } from 'next-auth/providers';
import { LiteralUnion } from 'next-auth/react';

export type TokenType = Pick<RegisterForm, 'orgInviteToken' | 'email'>;
export type SignInProvider = LiteralUnion<BuiltInProviderType>;
