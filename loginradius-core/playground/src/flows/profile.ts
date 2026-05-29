import type { LoginRadiusCore } from '../sdk';
import { $, escapeHtml } from '../dom';
import { showAuthCard, showProfileCard } from '../screens';
import { session } from '../session';

interface ProfileFlowDeps {
  lrCore: LoginRadiusCore;
  onSignedOut: () => void;
}

interface InfoRow {
  label: string;
  value: unknown;
}

const formatDate = (value: unknown): string | null => {
  if (!value) return null;
  try {
    return new Date(String(value)).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
};

const renderInfoRows = (rows: InfoRow[]): string =>
  rows
    .map(
      (row) => `
    <div class="info-item">
      <div class="info-label">${escapeHtml(row.label)}</div>
      <div class="info-value ${row.value ? '' : 'empty'}">
        ${row.value ? escapeHtml(row.value) : 'Not set'}
      </div>
    </div>
  `,
    )
    .join('');

export const initProfileFlow = ({ lrCore, onSignedOut }: ProfileFlowDeps) => {
  const loadingEl = $('#profile-loading');
  const errorEl = $('#profile-error');
  const errorMsg = $('#profile-error-msg');
  const contentEl = $('#profile-content');
  const logoutBtn = $<HTMLButtonElement>('#logout-btn');

  const showError = (msg: string) => {
    loadingEl.hidden = true;
    contentEl.hidden = true;
    errorEl.hidden = false;
    errorMsg.textContent = msg;
  };

  const render = (profile: any) => {
    loadingEl.hidden = true;
    errorEl.hidden = true;
    contentEl.hidden = false;

    const avatar = $('#profile-avatar');
    if (profile.ImageUrl) {
      avatar.innerHTML = `<img src="${escapeHtml(profile.ImageUrl)}" alt="Profile" />`;
    } else {
      const initial =
        (profile.FirstName || profile.Email?.[0]?.Value || 'U')[0]?.toUpperCase() ||
        'U';
      avatar.textContent = initial;
    }

    $('#profile-name').textContent =
      [profile.FirstName, profile.LastName].filter(Boolean).join(' ') || 'User';
    $('#profile-email').textContent = profile.Email?.[0]?.Value ?? '';

    const badges: string[] = [
      `<span class="badge ${profile.EmailVerified ? '' : 'unverified'}">
         <span class="dot"></span>
         ${profile.EmailVerified ? 'Email verified' : 'Email unverified'}
       </span>`,
    ];
    if (profile.Provider) {
      badges.push(
        `<span class="badge"><span class="dot"></span>${escapeHtml(profile.Provider)}</span>`,
      );
    }
    $('#profile-badges').innerHTML = badges.join('');

    $('#account-info').innerHTML = renderInfoRows([
      { label: 'User ID (UID)', value: profile.Uid },
      { label: 'Email Verified', value: profile.EmailVerified ? 'Yes' : 'No' },
      {
        label: 'Phone Verified',
        value: profile.PhoneIdVerified ? 'Yes' : 'No',
      },
      { label: 'Provider', value: profile.Provider },
      { label: 'Created', value: formatDate(profile.CreatedDate) },
      { label: 'Last Login', value: formatDate(profile.LastLoginDate) },
    ]);

    $('#personal-info').innerHTML = renderInfoRows([
      { label: 'First Name', value: profile.FirstName },
      { label: 'Last Name', value: profile.LastName },
      { label: 'Username', value: profile.UserName },
      { label: 'Phone', value: profile.PhoneId },
      { label: 'Date of Birth', value: profile.BirthDate },
      { label: 'Gender', value: profile.Gender },
      { label: 'Country', value: profile.Country?.Name },
      { label: 'City', value: profile.City },
    ]);

    $('#raw-json').textContent = JSON.stringify(profile, null, 2);
  };

  const load = async (accessToken: string) => {
    showProfileCard();
    loadingEl.hidden = false;
    errorEl.hidden = true;
    contentEl.hidden = true;

    await lrCore.controller.getAccount(
      accessToken,
      (response: any) => {
        const ok = response?.success || response?.IsPosted;
        const data =
          response?.data ??
          response?.Data?.Profile ??
          response?.Data ??
          response;

        if (ok && data) {
          render(data);
        } else if (data && (data.Uid || data.ID || data.Email)) {
          render(data);
        } else {
          showError(response?.error || 'Failed to load profile');
        }
      },
      (error: any) => {
        console.error('getAccount error:', error);
        // Token likely invalid/expired — drop session and return to login.
        if (error?.errorCode === 905 || error?.data?.ErrorCode === 905) {
          session.clearToken();
          onSignedOut();
          return;
        }
        showError(
          error?.data?.Message || error?.error || 'Failed to load profile',
        );
      },
    );
  };

  logoutBtn.addEventListener('click', () => {
    lrCore.controller.ssoLogout(
      () => {
        session.clearToken();
        showAuthCard();
        onSignedOut();
      },
      () => {
        // Clear locally even if remote logout fails.
        session.clearToken();
        showAuthCard();
        onSignedOut();
      },
    );
  });

  return { load };
};
