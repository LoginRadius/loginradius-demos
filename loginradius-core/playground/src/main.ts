import LoginRadiusCore from '@loginradius/loginradius-core';
import '@loginradius/loginradius-core/styles/index.css';
import './style.css';
import {
  ApiResponse,
  AuthResponse,
  ApiError,
} from '@loginradius/loginradius-core';
// Initialize LoginRadius Core
const loginRadiusOptions = {
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
  verificationUrl: import.meta.env.VITE_LOGINRADIUS_VERIFICATION_URL,
  resetPasswordUrl: import.meta.env.VITE_LOGINRADIUS_RESET_PASSWORD_URL,
  callbackUrl: import.meta.env.VITE_LOGINRADIUS_CALLBACK_URL,
};

console.log('Initializing LoginRadius Core with options:', loginRadiusOptions);

// Create an instance of LoginRadiusCore
let lrCore: LoginRadiusCore;

// Get the auth container
const authContainer = document.getElementById('auth-container');
const messageDiv = document.getElementById('message');

// Initialize LoginRadius Core asynchronously
LoginRadiusCore.createLoginRadius(loginRadiusOptions)
  .then(async (instance) => {
    lrCore = instance;
    console.log('LoginRadius Core initialized successfully');

    // Get the login schema
    const loginSchema = await lrCore.getSchema('loginFormSchema', {});
    console.log('Login Schema:', loginSchema);

    if (authContainer) {
      // Render login form based on schema
      renderLoginForm(loginSchema);
    }
  })
  .catch((error) => {
    console.error('Failed to initialize LoginRadius Core:', error);
    if (messageDiv) {
      messageDiv.textContent = `Initialization failed: ${error.message}`;
      messageDiv.style.color = 'red';
    }
  });

function renderLoginForm(schema: any) {
  if (!authContainer) return;

  // Build form fields dynamically from schema
  let formFields = '';

  if (schema.LoginFormSchema && Array.isArray(schema.LoginFormSchema)) {
    schema.LoginFormSchema.forEach((field: any) => {
      if (field.type === 'string' && field.display) {
        const inputType =
          field.name === 'password'
            ? 'password'
            : field.name === 'emailid'
            ? 'email'
            : 'text';
        formFields += `
          <div>
            <label for="${field.name}">${field.display}${
          field.rules?.includes('required') ? ' *' : ''
        }:</label>
            <input 
              type="${inputType}" 
              id="${field.name}" 
              name="${field.name}" 
              ${field.rules?.includes('required') ? 'required' : ''}
              placeholder="${field.display}"
            />
          </div>
        `;
      }
    });
  } else {
    // Fallback to basic form
    formFields = `
      <div>
        <label for="emailid">Email *:</label>
        <input type="email" id="emailid" name="emailid" required />
      </div>
      <div>
        <label for="password">Password *:</label>
        <input type="password" id="password" name="password" required />
      </div>
    `;
  }

  authContainer.innerHTML = `
    <div class="auth-form">
      <h2>Login</h2>
      <form id="login-form">
        ${formFields}
        <button type="submit">Login</button>
      </form>
      <div id="message"></div>
    </div>
  `;

  // Handle form submission
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const messageDiv = document.getElementById('message');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!lrCore) {
      if (messageDiv) {
        messageDiv.textContent = 'SDK not initialized yet';
        messageDiv.style.color = 'red';
      }
      return;
    }

    // Collect form data
    const formData = new FormData(loginForm);
    const payload: any = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    console.log('Login payload:', payload);

    try {
      if (messageDiv) {
        messageDiv.textContent = 'Logging in...';
        messageDiv.style.color = 'blue';
      }

      // Use LoginRadius Core controller to login
      const response: ApiResponse<AuthResponse> = await lrCore.controller.login(
        payload,
        (successResponse: ApiResponse<AuthResponse>) => {
          console.log('Login successful:', successResponse);
          if (messageDiv) {
            messageDiv.textContent = 'Login successful!';
            messageDiv.style.color = 'green';
          }
          // Display user info
          if (successResponse.data) {
            const userInfo = document.createElement('pre');
            userInfo.textContent = JSON.stringify(
              successResponse.data,
              null,
              2
            );
            userInfo.style.background = '#e0ffe0';
            userInfo.style.padding = '10px';
            userInfo.style.borderRadius = '4px';
            userInfo.style.marginTop = '10px';
            authContainer?.appendChild(userInfo);
          }
        },
        (error: ApiError) => {
          console.error('Login error:', error);
          if (messageDiv) {
            messageDiv.textContent = `Login failed: ${
              error.error || 'Unknown error'
            }`;
            if (error.errorCode) {
              messageDiv.textContent += ` (Code: ${error.errorCode})`;
            }
            messageDiv.style.color = 'red';
          }
        }
      );

      console.log('Login response:', response);
    } catch (error: any) {
      console.error('Login error:', error);
      if (messageDiv) {
        messageDiv.textContent = `Login failed: ${error.message || error}`;
        messageDiv.style.color = 'red';
      }
    }
  });
}
