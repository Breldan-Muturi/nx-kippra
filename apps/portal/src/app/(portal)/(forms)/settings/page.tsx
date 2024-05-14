'use server';
import { getUserById } from '@/helpers/user.helper';
import { currentUserId } from '@/lib/auth';
import ProfileForm from '../../components/common/forms/profile-form/profile-form';

const Settings = async () => {
  const userId = await currentUserId();
  if (!userId) return null;
  const userInformation = await getUserById(userId);
  if (!userInformation) return null;
  return <ProfileForm user={userInformation} />;
};

export default Settings;
