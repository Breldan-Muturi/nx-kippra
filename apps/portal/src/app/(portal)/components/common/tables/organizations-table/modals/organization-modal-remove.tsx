'use client';
import React, { useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { TableModalProps } from '@/types/tables.types';
import {
  RemoveOrgData,
  removeOrganization,
} from '@/actions/organization/remove.organization.actions';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RemoveOrgInfo,
  createRemoveOrgSchema,
} from '@/validation/organization/organization.validation';
import { FormFieldType } from '@/types/form-field.types';
import OrgUser from './org-user-info';
import { Form } from '@/components/ui/form';
import ReusableForm from '@/components/form/ReusableForm';
import { useRouter } from 'next/navigation';
import SubmitButton from '@/components/form/SubmitButton';

type RemoveOrgModalProps = Omit<TableModalProps, 'id'> &
  Omit<RemoveOrgData, 'deleteOrg'>;

const RemoveOrgModal = ({
  open,
  handleDismiss,
  orgId,
  updateEmail,
  updateName,
  otherOrgUsers,
}: RemoveOrgModalProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(
      createRemoveOrgSchema({ updateEmail, updateName, otherOrgUsers }),
    ),
    mode: 'onChange',
  });
  const { handleSubmit } = form;

  const removeOrgForm: FormFieldType<RemoveOrgInfo>[] = [
    ...(updateEmail
      ? ([
          {
            name: 'newEmail',
            type: 'email',
            label: 'Enter new contact email',
            placeholder: 'eg. anne.wanjiku@email.com',
            description: 'This sets the new organization contact person email',
          },
        ] as FormFieldType<RemoveOrgInfo>[])
      : []),
    ...(updateName
      ? ([
          {
            name: 'newName',
            type: 'text',
            label: 'Enter new contact name',
            placeholder: 'eg. Anne Wanjiku',
            description: 'This sets the new organization contact person name',
          },
        ] as FormFieldType<RemoveOrgInfo>[])
      : []),
    ...(otherOrgUsers
      ? ([
          {
            name: 'newOwnerId',
            type: 'combobox',
            label: 'New organization owner',
            className: 'col-span-2',
            noResults: 'No matching users',
            description: 'Select a new organization owner',
            comboboxOptions: otherOrgUsers.map((orgUser) => {
              const { value: orgUserId, optionLabel } = orgUser;
              return {
                value: orgUserId,
                optionLabel,
                render: (value) => {
                  const isSelected = value === orgUserId;
                  return <OrgUser isSelected={isSelected} {...orgUser} />;
                },
              };
            }),
            comboboxTrigger: (value) => {
              if (!value) {
                return 'Select organization user';
              } else {
                return otherOrgUsers.find(
                  ({ value: orgUserId }) => orgUserId === value,
                )?.optionLabel;
              }
            },
            handleSelect: (selectedValue, value) => {
              const orgUserValue = otherOrgUsers.find(
                ({ value: orgUserId }) => orgUserId === selectedValue,
              )?.value;
              return orgUserValue || value;
            },
          },
        ] as FormFieldType<RemoveOrgInfo>[])
      : []),
  ];

  const onSubmit: SubmitHandler<RemoveOrgInfo> = (values) =>
    startTransition(() => {
      removeOrganization({ id: orgId, ...values }).then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success(data.success);
          router.refresh();
          handleDismiss();
        }
      });
    });

  return (
    <AlertDialog open={open} onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Remove me from this organization?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will remove you from this organizations as a user, or
                participant in it's applications. Otherwise, it will remove any
                pending invite to this organization.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <ReusableForm formFields={removeOrgForm} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <SubmitButton
                label={isPending ? 'Removing organization' : 'Continue'}
                isSubmitting={isPending}
                className="bg-red-600"
              />
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveOrgModal;
