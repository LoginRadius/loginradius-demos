import {
  ChangePin,
  ChangePassword,
  LinkAccount,
  AddEmail,
  PersonalDetails,
  EditPhone,
  VerifyEmailPhone,
  EditUsername,
  SetupTwoFactorAuth,
  AddPasskey,
  DeleteAccount,
  Profile,
  useLRAuth,
} from '@loginradius/loginradius-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProfileSdk = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useLRAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Profile />
      <PersonalDetails />
      <AddEmail />
      <EditPhone />
      <ChangePassword />
      <ChangePin />
      <EditUsername />
      <VerifyEmailPhone />
      <SetupTwoFactorAuth />
      <AddPasskey />
      <LinkAccount />
      <DeleteAccount />
    </>
  );
};
