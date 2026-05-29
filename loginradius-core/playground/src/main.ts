import './styles.css';

import { initSDK } from './sdk';
import { initLoginFlow } from './flows/login';
import { initSignupFlow } from './flows/signup';
import { initProfileFlow } from './flows/profile';
import { session } from './session';
import { setError, $ } from './dom';
import { showAuthCard, showScreen } from './screens';
import { appTemplate } from './templates';

const mount = () => {
  $('#app').innerHTML = appTemplate();
};

const bootstrap = async () => {
  mount();
  try {
    const lrCore = await initSDK();

    const profile = initProfileFlow({
      lrCore,
      onSignedOut: () => {
        loginFlow.reset();
      },
    });

    const loginFlow = initLoginFlow({
      lrCore,
      onAuthenticated: (token) => profile.load(token),
    });

    initSignupFlow({
      lrCore,
      onAuthenticated: (token) => profile.load(token),
    });

    // Resume session if a token is already cached.
    const cachedToken = session.getToken();
    if (cachedToken) {
      profile.load(cachedToken);
    } else {
      showAuthCard();
      showScreen('email');
      $<HTMLInputElement>('#email-input').focus();
    }

    // Schema-driven login fields (non-blocking — falls back to static input).
    loginFlow.loadLoginSchema();
  } catch (err) {
    console.error('Failed to initialize LoginRadius Core:', err);
    const message =
      err instanceof Error ? err.message : 'Failed to initialize SDK';
    setError($('#email-input'), $('#email-error'), message);
  }
};

bootstrap();
