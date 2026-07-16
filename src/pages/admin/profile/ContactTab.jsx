import { I } from "../../../components/Icons.jsx";
import { PI } from "./ProfileIcons.jsx";
import { SDKCard } from "./SDKCard.jsx";
import {
  EmailWrapper,
  UpdatePhoneWrapper,
  EmailPhoneVerificationWrapper,
} from "../../../sdk/profile/index.jsx";
import { AddEmail, EditPhone } from "@loginradius/loginradius-react";

function EmailMock({ onSuccess, onError }) {
  const verificationProps = { embedded: true, onSuccess, onError };
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      <div className="contact-row">
        <div className="contact-icon"><PI.AtSign /></div>
        <div className="contact-meta">
          <div className="contact-value">aria.chen@northwind.io</div>
          <div className="contact-sub">Receives sign-in, security alerts, and billing</div>
        </div>
        <span className="badge badge-blue">Primary</span>
        <EmailPhoneVerificationWrapper
          {...verificationProps}
          fallback={
            <span className="badge badge-green">
              <span className="dot" />
              Verified
            </span>
          }
        />
        <button className="icon-btn" type="button"><I.More /></button>
      </div>
      <div className="contact-row">
        <div className="contact-icon"><PI.AtSign /></div>
        <div className="contact-meta">
          <div className="contact-value">aria@personal.me</div>
          <div className="contact-sub">Recovery only</div>
        </div>
        <EmailPhoneVerificationWrapper
          {...verificationProps}
          fallback={
            <div className="row" style={{ gap: 8 }}>
              <span className="badge badge-amber">
                <span className="dot" />
                Unverified
              </span>
              <button className="btn btn-secondary btn-sm" type="button">
                Resend verification
              </button>
            </div>
          }
        />
        <button className="icon-btn" type="button"><I.More /></button>
      </div>
    </div>
  );
}

function PhoneMock({ onSuccess, onError }) {
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      <div className="contact-row">
        <div className="contact-icon"><PI.Phone /></div>
        <div className="contact-meta">
          <div className="contact-value">+1 (415) ••• ••42</div>
          <div className="contact-sub">United States · Added Mar 12, 2026</div>
        </div>
        <EmailPhoneVerificationWrapper
          embedded
          onSuccess={onSuccess}
          onError={onError}
          fallback={
            <span className="badge badge-green">
              <span className="dot" />
              Verified
            </span>
          }
        />
        <button className="icon-btn" type="button"><I.More /></button>
      </div>
    </div>
  );
}

export function ContactTab({ onSuccess, onError }) {
  const wrapperProps = { embedded: true, onSuccess, onError };
  return (
    <div className="col" style={{ gap: 16 }}>
      <AddEmail embedded onSuccess={onSuccess} onError={onError} fallback={<EmailMock onSuccess={onSuccess} onError={onError} />} />

      <EditPhone embedded onSuccess={onSuccess} onError={onError} fallback={<PhoneMock onSuccess={onSuccess} onError={onError} />} />
    </div>
  );
}
