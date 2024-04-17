import {
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormProps,
} from 'react-hook-form';

const useNestedForm = <TFormValues extends FieldValues>(
  options: UseFormProps<TFormValues>,
) => {
  const { handleSubmit: internalSubmit, ...rest } =
    useForm<TFormValues>(options);
  const handleSubmit =
    (onSubmit: SubmitHandler<TFormValues>) =>
    async (e?: React.BaseSyntheticEvent<object, any, any> | undefined) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      await internalSubmit(onSubmit)(e);
    };

  return { handleSubmit, ...rest };
};

export default useNestedForm;
