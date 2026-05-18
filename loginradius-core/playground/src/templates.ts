const brandSvg = (width: number, height: number) => `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 48"
    width="${width}"
    height="${height}"
    role="img"
    aria-label="LoginRadius"
  >
    <rect x="0" y="4" width="40" height="40" rx="10" fill="#1a73e8" />
    <path
      d="M12 13 L12 35 L28 35"
      stroke="#fff"
      stroke-width="3.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <circle cx="30" cy="15" r="4.5" fill="#fff" />
    <text
      x="52"
      y="32"
      font-family="'Google Sans','Inter',system-ui,sans-serif"
      font-weight="600"
      font-size="22"
      fill="#202124"
      letter-spacing="-0.3"
    >
      Login<tspan fill="#1a73e8" font-weight="700">Radius</tspan>
    </text>
  </svg>
`;

const emailScreen = () => `
  <section id="screen-email" class="screen active" data-screen="email">
    <h1 class="title">Sign in</h1>
    <p class="subtitle">Use your LoginRadius account to continue</p>

    <div class="input-group">
      <input
        type="email"
        id="email-input"
        placeholder=" "
        autocomplete="email"
        required
      />
      <label>Email address</label>
      <div class="error-message" id="email-error"></div>
    </div>

    <div class="btn-row">
      <a href="#" class="link" id="go-signup">Create account</a>
      <button class="btn-primary" id="email-next-btn">Next</button>
    </div>
  </section>
`;

const passwordScreen = () => `
  <section id="screen-password" class="screen" data-screen="password">
    <h1 class="title">Welcome</h1>

    <div class="user-chip" id="user-chip" tabindex="0" role="button">
      <span class="avatar" id="user-avatar">U</span>
      <span id="user-email">user@example.com</span>
      <span aria-hidden="true">▼</span>
    </div>

    <div id="login-fields">
      <div class="input-group">
        <input
          type="password"
          name="password"
          placeholder=" "
          autocomplete="current-password"
          required
        />
        <label>Password</label>
        <div class="error-message"></div>
      </div>
    </div>

    <label class="password-toggle">
      <input type="checkbox" id="show-password" /> Show password
    </label>

    <div class="btn-row">
      <a href="#" class="link" id="forgot-password">Forgot password?</a>
      <button class="btn-primary" id="login-btn">Sign in</button>
    </div>
  </section>
`;

const signupScreen = () => `
  <section id="screen-signup" class="screen" data-screen="signup">
    <h1 class="title">Create your account</h1>
    <p class="subtitle">Fill in your details to register</p>

    <div id="signup-fields">
      <div class="inline-loading">
        <div class="spinner spinner-sm"></div>
        <span>Loading registration form…</span>
      </div>
    </div>

    <div class="error-message" id="signup-error"></div>

    <div class="btn-row">
      <a href="#" class="link" id="go-login">Back to sign in</a>
      <button class="btn-primary" id="signup-btn" disabled>Sign up</button>
    </div>
  </section>
`;

const loadingScreen = () => `
  <section id="screen-loading" class="screen loading" data-screen="loading">
    <div class="spinner"></div>
    <p id="loading-text">Working…</p>
  </section>
`;

const noticeScreen = () => `
  <section id="screen-notice" class="screen notice" data-screen="notice">
    <div class="icon-success">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
          fill="#fff"
        />
      </svg>
    </div>
    <h2 class="title">All set</h2>
    <p class="subtitle" id="notice-text">
      Check your inbox to verify your email.
    </p>
    <div class="btn-row btn-row-center">
      <button class="btn-primary" id="notice-back-btn">Back to sign in</button>
    </div>
  </section>
`;

const authCard = () => `
  <section class="card auth-card" id="auth-card">
    <div class="brand">${brandSvg(220, 44)}</div>
    ${emailScreen()}
    ${passwordScreen()}
    ${signupScreen()}
    ${loadingScreen()}
    ${noticeScreen()}
  </section>
`;

const profileCard = () => `
  <section class="card profile-card" id="profile-card" hidden>
    <header class="profile-topbar">
      <div class="brand brand-sm">${brandSvg(180, 30)}</div>
      <button class="btn-outline" id="logout-btn">Sign out</button>
    </header>

    <div id="profile-loading" class="loading">
      <div class="spinner"></div>
      <p>Loading profile…</p>
    </div>

    <div id="profile-error" class="profile-error" hidden>
      <div class="icon-error">!</div>
      <p class="error-message show" id="profile-error-msg">
        Failed to load profile
      </p>
    </div>

    <div id="profile-content" hidden>
      <div class="profile-header">
        <div class="avatar-wrap">
          <div class="avatar avatar-lg" id="profile-avatar">U</div>
        </div>
        <div class="profile-name" id="profile-name">User</div>
        <div class="profile-email" id="profile-email"></div>
        <div class="profile-badges" id="profile-badges"></div>
      </div>

      <div class="profile-body">
        <section class="section">
          <h3 class="section-title">Account</h3>
          <div class="info-grid" id="account-info"></div>
        </section>

        <section class="section">
          <h3 class="section-title">Personal</h3>
          <div class="info-grid" id="personal-info"></div>
        </section>

        <details class="raw-data">
          <summary>View raw API response</summary>
          <pre id="raw-json"></pre>
        </details>
      </div>
    </div>
  </section>
`;

export const appTemplate = (): string => `
  ${authCard()}
  ${profileCard()}
  <p class="footnote">Powered by LoginRadius CIAM</p>
`;
