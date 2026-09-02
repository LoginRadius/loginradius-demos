"use client";

import { AccountCard, SdkWidget, WIDGETS } from "../../sdk/index.jsx";
import { I } from "../../components/Icons.jsx";
import { Rows, Note } from "./Fallbacks.jsx";
import { LinkedAccounts } from "./LinkedAccounts.jsx";

// Each section is BBC card chrome we own, wrapping an SDK widget. The
// `fallback` on every widget is what renders with NEXT_PUBLIC_USE_SDK=false or if that
// widget throws — the page keeps its shape either way.

function DetailsPanel({ onSuccess, onError }) {
  return (
    <div className="stack">
      <AccountCard
        title="Your details"
        sub="The name and information shown on your BBC account."
      >
        <SdkWidget
          name={WIDGETS.personalDetails}
          embedded
          stepId="profileDetails"
          onSuccess={onSuccess}
          onError={onError}
          fallback={
            <Rows
              rows={[
                ["Name", "—"],
                ["Date of birth", "—"],
                ["Country", "—"],
              ]}
            />
          }
        />
      </AccountCard>

      <AccountCard
        title="Display name"
        sub="How you appear when you comment or contribute."
      >
        <SdkWidget
          name={WIDGETS.username}
          embedded
          stepId="username"
          onSuccess={onSuccess}
          onError={onError}
          fallback={
            <Note>
              Display names are available when the tenant has unique usernames
              enabled.
            </Note>
          }
        />
      </AccountCard>
    </div>
  );
}

function SecurityPanel({ onSuccess, onError }) {
  return (
    <div className="stack">
      <AccountCard
        title="Password"
        sub="Use a strong password you don't reuse anywhere else."
      >
        <SdkWidget
          name={WIDGETS.password}
          embedded
          stepId="password"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Rows rows={[["Password", "••••••••••"]]} />}
        />
      </AccountCard>

      <AccountCard
        title="Two-step verification"
        sub="Ask for a second factor when signing in from a new device."
        tag={<span className="tag">Recommended</span>}
      >
        <SdkWidget
          name={WIDGETS.mfa}
          embedded
          stepId="mfa"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Note>Two-step verification is configured on the tenant.</Note>}
        />
      </AccountCard>

      <AccountCard
        title="Passkeys"
        sub="Sign in with your device unlock instead of a password."
      >
        <SdkWidget
          name={WIDGETS.passkey}
          embedded
          stepId="passkey"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Note>Passkeys appear here when enabled on the tenant.</Note>}
        />
      </AccountCard>

      <AccountCard title="PIN" sub="A short code for quick re-authentication.">
        <SdkWidget
          name={WIDGETS.pin}
          embedded
          stepId="pin"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Note>PIN authentication is off for this tenant.</Note>}
        />
      </AccountCard>

      <AccountCard
        title="Backup codes"
        sub="One-time codes to use if you lose your second factor."
      >
        <SdkWidget
          name={WIDGETS.backupCodes}
          embedded
          stepId="backupCodes"
          onSuccess={onSuccess}
          onError={onError}
          fallback={
            <Note>
              Backup codes become available once a second factor is verified.
            </Note>
          }
        />
      </AccountCard>
    </div>
  );
}

function ContactPanel({ onSuccess, onError }) {
  return (
    <div className="stack">
      <AccountCard
        title="Email addresses"
        sub="Used to sign in, and for anything we need to send you."
      >
        <SdkWidget
          name={WIDGETS.email}
          embedded
          stepId="email"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Rows rows={[["Primary email", "—"]]} />}
        />
      </AccountCard>

      <AccountCard
        title="Mobile number"
        sub="For SMS codes and account recovery."
      >
        <SdkWidget
          name={WIDGETS.phone}
          embedded
          stepId="phone"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Note>Phone sign-in is off for this tenant.</Note>}
        />
      </AccountCard>
    </div>
  );
}

function ConnectedPanel({ onSuccess, onError }) {
  return (
    <div className="stack">
      <AccountCard
        title="Connected accounts"
        sub="Services you've linked for one-tap sign in."
      >
        <SdkWidget
          name={WIDGETS.social}
          embedded
          stepId="social"
          onSuccess={onSuccess}
          onError={onError}
          fallback={
            <Note>
              Social providers appear here once configured on the tenant and your
              email is verified.
            </Note>
          }
        />
      </AccountCard>
    </div>
  );
}

function ClosePanel({ onSuccess, onError }) {
  return (
    <div className="stack">
      <div className="notice">
        <I.Alert width={18} height={18} />
        <div>
          Closing your account removes your saved stories, followed topics and
          sign-in methods. This can't be undone.
        </div>
      </div>

      <AccountCard
        title="Close your BBC account"
        sub="You'll be asked to confirm by email before anything is deleted."
        tag={<span className="tag tag-danger">Permanent</span>}
      >
        <SdkWidget
          name={WIDGETS.deleteAccount}
          embedded
          stepId="deleteAccount"
          onSuccess={onSuccess}
          onError={onError}
          fallback={<Note>Account closure is handled by the SDK widget.</Note>}
        />
      </AccountCard>
    </div>
  );
}

function LinkedAccountsPanel() {
  // Unlike the sections above, this one isn't an SDK widget — the account
  // graph lives in a `link_account` custom object that only the management
  // API can read, so it goes through this app's own /api/linked-accounts.
  return <LinkedAccounts />;
}

export const SECTIONS = [
  {
    id: "details",
    label: "Your details",
    icon: I.User,
    title: "Your details",
    blurb: "The personal information held on your BBC account.",
    Panel: DetailsPanel,
  },
  {
    id: "security",
    label: "Sign in & security",
    icon: I.Lock,
    title: "Sign in & security",
    blurb:
      "Manage how you prove it's you — password, two-step verification, passkeys and backup codes.",
    Panel: SecurityPanel,
  },
  {
    id: "contact",
    label: "Contact details",
    icon: I.Mail,
    title: "Contact details",
    blurb: "The email address and mobile number linked to your account.",
    Panel: ContactPanel,
  },
  {
    id: "connected",
    label: "Connected accounts",
    icon: I.Link,
    title: "Connected accounts",
    blurb: "Other services you've linked to sign in more quickly.",
    Panel: ConnectedPanel,
  },
  {
    id: "linked",
    label: "Linked accounts",
    icon: I.Users,
    title: "Linked accounts & profiles",
    blurb:
      "Guardian and child accounts linked to yours, and the viewing profiles on this account.",
    Panel: LinkedAccountsPanel,
  },
  {
    id: "close",
    label: "Close account",
    icon: I.Trash,
    title: "Close your account",
    blurb: "Permanently remove your BBC account and everything saved to it.",
    danger: true,
    Panel: ClosePanel,
  },
];