import type { ApiPayload } from '@loginradius/loginradius-core';
import type { LoginRadiusCore } from '../sdk';
import { $, clearError, setError } from '../dom';
import { setLoadingText, setNoticeText, showScreen } from '../screens';
import { extractFields, isRenderableField, renderFields } from '../schemaForm';
import { session } from '../session';

interface SignupFlowDeps {
  lrCore: LoginRadiusCore;
  onAuthenticated: (accessToken: string) => void;
}

export const initSignupFlow = ({ lrCore, onAuthenticated }: SignupFlowDeps) => {
  const goSignup = $('#go-signup');
  const goLogin = $('#go-login');
  const signupFields = $('#signup-fields');
  const signupBtn = $<HTMLButtonElement>('#signup-btn');
  const signupError = $('#signup-error');
  const noticeBack = $('#notice-back-btn');

  let registrationSchema: unknown = null;
  let signupInFlight = false;

  const loadSchema = async () => {
    if (registrationSchema) {
      render(registrationSchema);
      return;
    }
    try {
      registrationSchema = await lrCore.getSchema(
        'registrationFormSchema',
        {},
      );
      render(registrationSchema);
    } catch (err) {
      console.error('registrationFormSchema unavailable:', err);
      signupFields.innerHTML =
        '<p class="error-message show">Failed to load registration form. Please try again.</p>';
    }
  };

  const render = (schema: unknown) => {
    const fields = extractFields(schema).filter(isRenderableField);
    if (fields.length === 0) {
      signupFields.innerHTML =
        '<p class="error-message show">No fields found in registration schema.</p>';
      return;
    }
    signupFields.innerHTML = renderFields(fields);
    signupBtn.disabled = false;

    signupFields
      .querySelectorAll<HTMLInputElement>(
        'input[type="text"], input[type="email"], input[type="password"]',
      )
      .forEach((input) => {
        input.addEventListener('focus', () =>
          clearError(
            input,
            input.parentElement?.querySelector('.error-message') ?? null,
          ),
        );
      });
  };

  const collectPayload = (): {
    payload: ApiPayload;
    valid: boolean;
  } => {
    const payload: ApiPayload = {};
    let valid = true;

    signupFields
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
      .forEach((input) => {
        const name = input.name;
        const isCheckbox =
          input instanceof HTMLInputElement && input.type === 'checkbox';
        const value = isCheckbox
          ? (input as HTMLInputElement).checked
          : input.value.trim();
        const errorEl =
          input.parentElement?.querySelector('.error-message') ?? null;
        const required = (input as HTMLInputElement).required;

        if (required && !value) {
          const label = input.previousElementSibling?.textContent || name;
          setError(input, errorEl, `${label} is required`);
          valid = false;
          return;
        }

        if (!value) return;
        if (name.toLowerCase().includes('email')) {
          payload.email = [{ type: 'Primary', value }];
        } else {
          payload[name] = value;
        }
      });

    return { payload, valid };
  };

  const handleRegister = async () => {
    if (signupInFlight) return;

    const { payload, valid } = collectPayload();
    if (!valid) return;

    clearError(signupBtn, signupError);
    signupInFlight = true;
    setLoadingText('Creating account…');
    showScreen('loading');

    await lrCore.controller.register(
      payload,
      (response: any) => {
        const ok = response?.success || response?.IsPosted;
        const data = response?.data ?? response?.Data ?? {};
        if (!ok) {
          showError(
            response?.error ||
              data?.Message ||
              response?.Message ||
              'Registration failed. Please try again.',
          );
          return;
        }
        const accessToken = data.access_token;
        if (accessToken) {
          session.setToken(accessToken);
          onAuthenticated(accessToken);
        } else {
          setNoticeText(
            'Account created. Check your inbox to verify your email.',
          );
          showScreen('notice');
        }
      },
      (error: any) => {
        console.error('register error:', error);
        showError(
          error?.data?.Description ||
            error?.data?.Message ||
            error?.error ||
            'Registration failed. Please try again.',
        );
      },
    );

    signupInFlight = false;
  };

  const showError = (msg: string) => {
    showScreen('signup');
    setError(signupBtn, signupError, msg);
  };

  goSignup.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('signup');
    loadSchema();
  });

  goLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('email');
    $<HTMLInputElement>('#email-input').focus();
  });

  noticeBack.addEventListener('click', () => {
    showScreen('email');
    $<HTMLInputElement>('#email-input').focus();
  });

  signupBtn.addEventListener('click', handleRegister);
};
