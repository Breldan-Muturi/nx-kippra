import { newVerification } from '@/actions/account/new-verification.actions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const useNewVerification = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    const onSubmit = async () => {
      if (success || error) return;
      if (!token) {
        setError('Missing token!');
        return;
      }
      try {
        const data = await newVerification(token);
        setSuccess(data.success);
        setError(data.error);
      } catch {
        setError('Something went wrong. Please try again later');
      }
    };

    onSubmit();
  }, [token, success, error]);

  return { error, success };
};

export default useNewVerification;
