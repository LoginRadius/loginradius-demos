import {
  PinProfileComponent,
  PasswordProfileComponent,
  SocialProviderProfileComponent,
  EmailProfileComponent,
  ProfileDetailsComponent,
  UpdatePhoneProfileComponent,
  EmailPhoneVerificationComponent,
  UsernameComponent,
  MFAProfileComponent,
  PasskeyProfileComponent,
  DeleteProfileComponent,
  Profile,
} from '@loginradius/loginradius-react-sdk';
import { useLRAuth } from '@loginradius/loginradius-react-sdk';
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
      <ProfileDetailsComponent />
      <EmailProfileComponent />
      <UpdatePhoneProfileComponent />
      <PasswordProfileComponent />
      <PinProfileComponent />
      <UsernameComponent />
      <EmailPhoneVerificationComponent />
      <MFAProfileComponent />
      <PasskeyProfileComponent />
      <SocialProviderProfileComponent />
      <DeleteProfileComponent />
    </>
  );
};
