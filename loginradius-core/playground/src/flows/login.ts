import type { ApiPayload } from '@loginradius/loginradius-core';
import type { LoginRadiusCore } from '../sdk';
import { $, clearError, isValidEmail, setError } from '../dom';
import { setLoadingText, showScreen } from '../screens';
import {
  extractFields,
  isIdentifierField,
  isRenderableField,
  renderFields,
} from '../schemaForm';
import { session } from '../session';

interface LoginFlowDeps {
  lrCore: LoginRadiusCore;
  onAuthenticated: (accessToken: string) => void;
}

export const initLoginFlow = ({ lrCore, onAuthenticated }: LoginFlowDeps) => {
  const emailInput = $<HTMLInputElement>('#email-input');
  const emailError = $('#email-error');
  const emailNext = $<HTMLButtonElement>('#email-next-btn');
  const userChip = $('#user-chip');
  const userEmailLabel = $('#user-email');
  const userAvatar = $('#user-avatar');
  const loginFields = $('#login-fields');
  const loginBtn = $<HTMLButtonElement>('#login-btn');
  const showPass = $<HTMLInputElement>('#show-password');

  let currentEmail = '';
  let emailCheckInFlight = false;
  let loginInFlight = false;

  const passwordInput = (): HTMLInputElement | null =>
    loginFields.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement | null;

  const passwordError = (input: HTMLInputElement | null): Element | null =>
    input?.parentElement?.querySelector('.error-message') ?? null;

  // Render schema-driven password fields (falls back to static input if unavailable).
  const loadLoginSchema = async () => {
    try {
      const schema = await lrCore.getSchema('loginFormSchema', {});
      const fields = extractFields(schema)
        .filter(isRenderableField)
        .filter((f) => !isIdentifierField(f));
      if (fields.length > 0) {
        loginFields.innerHTML = renderFields(fields);
        showPass.checked = false;
      }
    } catch (err) {
      console.warn('loginFormSchema unavailable, using fallback:', err);
    }
  };

  const handleEmailNext = async () => {
    if (emailCheckInFlight) return;
    const email = emailInput.value.trim();

    if (!email) {
      setError(emailInput, emailError, 'Enter your email address');
      return;
    }
    if (!isValidEmail(email)) {
      setError(emailInput, emailError, 'Enter a valid email address');
      return;
    }

    clearError(emailInput, emailError);
    emailCheckInFlight = true;
    emailNext.disabled = true;
    emailNext.textContent = 'Checking…';

    try {
      await lrCore.controller.checkEmailAvailability(
        email,
        (response: any) => {
          if (response?.success && response?.data?.IsExist) {
            currentEmail = email;
            userEmailLabel.textContent = email;
            userAvatar.textContent = email[0].toUpperCase();
            showScreen('password');
            passwordInput()?.focus();
          } else {
            setError(
              emailInput,
              emailError,
              'Email not registered. Please create an account.',
            );
          }
        },
        (error: any) => {
          console.error('checkEmailAvailability error:', error);
          setError(
            emailInput,
            emailError,
            error?.error || 'Unable to verify email. Please try again.',
          );
        },
      );
    } finally {
      emailCheckInFlight = false;
      emailNext.disabled = false;
      emailNext.textContent = 'Next';
    }
  };

  const collectCredentials = (): {
    credentials: ApiPayload;
    invalid: HTMLElement | null;
  } => {
    const credentials: ApiPayload = { emailid: currentEmail };
    let invalid: HTMLElement | null = null;

    loginFields
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
      .forEach((input) => {
        if (!input.name) return;
        const isCheckbox =
          input instanceof HTMLInputElement && input.type === 'checkbox';
        const value = isCheckbox
          ? (input as HTMLInputElement).checked
          : input.value.trim();
        const errorEl =
          input.parentElement?.querySelector('.error-message') ?? null;

        if ((input as HTMLInputElement).required && !value) {
          setError(input, errorEl, `${input.name} is required`);
          if (!invalid) invalid = input as HTMLElement;
          return;
        }
        clearError(input, errorEl);
        credentials[input.name] = value;
      });

    return { credentials, invalid };
  };

  const handleLogin = async () => {
    if (loginInFlight) return;

    const { credentials, invalid } = collectCredentials();
    if (invalid) {
      invalid.focus();
      return;
    }

    loginInFlight = true;
    setLoadingText('Signing in…');
    showScreen('loading');

    await lrCore.controller.login(
      credentials,
      (response: any) => {
        const ok = response?.success || response?.IsPosted;
        const data = response?.data ?? response?.Data ?? {};
        if (!ok) {
          handleLoginError(response);
          return;
        }
        const accessToken = data.access_token;
        if (accessToken) {
          session.setToken(accessToken);
          onAuthenticated(accessToken);
        } else {
          showScreen('notice');
          $('#notice-text').textContent =
            'Sign-in succeeded but no access token was returned.';
        }
      },
      (error: any) => {
        console.error('login error:', error);
        handleLoginError(error);
      },
    );

    loginInFlight = false;
  };

  const handleLoginError = (error: any) => {
    showScreen('password');
    const msg =
      error?.data?.Description ||
      error?.error ||
      'Wrong password. Try again.';
    const pwd = passwordInput();
    setError(pwd, passwordError(pwd), msg);
    if (pwd) {
      pwd.value = '';
      pwd.focus();
    }
  };

  // Wire events
  emailNext.addEventListener('click', handleEmailNext);
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleEmailNext();
  });

  userChip.addEventListener('click', () => {
    showScreen('email');
    emailInput.focus();
  });

  showPass.addEventListener('change', () => {
    const pwd = passwordInput();
    if (pwd) pwd.type = showPass.checked ? 'text' : 'password';
  });

  loginBtn.addEventListener('click', handleLogin);
  loginFields.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && target.matches('input')) {
      e.preventDefault();
      handleLogin();
    }
  });

  $('#forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    // Out of scope for this demo — wire to lrCore.controller.forgotPassword() in a real app.
    alert('Forgot-password flow not implemented in this demo.');
  });

  // Reset to email screen and refocus.
  const reset = () => {
    currentEmail = '';
    emailInput.value = '';
    clearError(emailInput, emailError);
    showScreen('email');
    emailInput.focus();
  };

  return { loadLoginSchema, reset };
};
