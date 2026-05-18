import { LoginRadiusProvider } from '@loginradius/loginradius-react-sdk';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './app/app';
import { ProfileSdk } from './app/Components/Sdkprofile';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const searchParams = new URLSearchParams(window.location.search);

const onLoading = function (isLoading: any) {
  const loader = document.getElementById('my-loader');
  if (!loader) return;

  if (isLoading) {
    loader.style.display = 'block';
  } else {
    loader.style.display = 'none';
  }
};
const loginRadiusOptions = {
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
  templateName: searchParams.get('brand') || undefined,
  verificationUrl: import.meta.env.VITE_LOGINRADIUS_VERIFICATION_URL,
  resetPasswordUrl: import.meta.env.VITE_LOGINRADIUS_RESET_PASSWORD_URL,
  callbackUrl: import.meta.env.VITE_LOGINRADIUS_CALLBACK_URL,
  disableLocalization:
    import.meta.env.VITE_LOGINRADIUS_LOCALIZATION === 'false',
  // AppName: import.meta.env.VITE_LOGINRADIUS_APPNAME || 'dev-sanjay',
  // templateName: "v3brand"
};
// console.log('LoginRadius Options:', loginRadiusOptions);
// Log options to debug
// console.log('LoginRadius Options:', loginRadiusOptions);
console.log('options', loginRadiusOptions);
root.render(
  <LoginRadiusProvider options={loginRadiusOptions} onLoading={onLoading}>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          {/* <Route path="/profile" element={<UserProfile />} /> */}
          <Route path="/user" element={<ProfileSdk />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </LoginRadiusProvider>,
);
