import { useOrgContext } from "@loginradius/loginradius-react-sdk";
import { I } from "../../../components/Icons.jsx";
import { PI } from "./ProfileIcons.jsx";
import { mockData } from "../../../services/mockData.js";
import { useAccountProfile } from "../../../hooks/useAccountProfile.jsx";

function deriveHero(profileData, fallback, activeOrgName) {
  const fb = fallback || mockData.currentUser;

  const firstName = profileData?.Firstname ?? "";
  const lastName = profileData?.Lastname ?? "";
  const email = profileData?.Email?.[0]?.Value ?? fb.email ?? "";

  const name =
    profileData?.Fullname ||
    `${firstName} ${lastName}`.trim() ||
    email ||
    "Signed-in user";

  const initials = profileData
    ? ((firstName[0] || email[0] || "U") + (lastName[0] || "")).toUpperCase()
    : fb.initials || "U";

  const imageUrl =
    profileData?.Imageurl ||
    profileData?.Thumbnailimageurl ||
    profileData?.Httpsimageurl ||
    profileData?.Gravatarimageurl ||
    null;

  const joinedRaw = profileData?.Createddate || profileData?.Signupdate;
  const joined = joinedRaw
    ? new Date(joinedRaw).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : fb.joined;

  // Prefer the active org from OrgContext over the profile's Organizations[0]
  // (which is a static list of every org the user belongs to, not the selected one).
  const orgName = activeOrgName || fb.org || mockData.org.name;

  return {
    name,
    email,
    initials,
    imageUrl,
    role: fb.role,
    org: orgName,
    joined,
    color: fb.color || "#1E5DDB",
  };
}

export function ProfileHero({ user: fallback }) {
  const { profileData } = useAccountProfile();
  const { currentOrg } = useOrgContext?.() || {};
  const user = deriveHero(profileData, fallback, currentOrg?.OrgName);
  const { color, imageUrl } = user;

  return (
    <div className="profile-hero">
      <div className="profile-hero-avatar-wrap">
        <div
          className="profile-hero-avatar"
          style={{
            background: imageUrl
              ? "transparent"
              : `linear-gradient(135deg, ${color}, ${color}cc)`,
            overflow: "hidden",
            padding: 0,
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={user.name}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }}
              referrerPolicy="no-referrer"
            />
          ) : (
            user.initials
          )}
        </div>
        <button className="profile-hero-avatar-edit" title="Change photo" type="button">
          <PI.Camera />
        </button>
      </div>
      <div className="profile-hero-meta">
        <div className="profile-hero-name-row">
          <h2 className="profile-hero-name">{user.name}</h2>
          {user.role && (
            <span className="badge badge-blue">
              <span className="dot" />
              {user.role}
            </span>
          )}
        </div>
        <div className="profile-hero-sub">
          {user.email && (
            <span>
              <I.Mail style={{ width: 13, height: 13, verticalAlign: -2, marginRight: 6, color: "var(--text-4)" }} />
              {user.email}
            </span>
          )}
          {user.org && (
            <>
              <span className="dot-sep">·</span>
              <span>{user.org}</span>
            </>
          )}
          {user.joined && (
            <>
              <span className="dot-sep">·</span>
              <span>Joined {user.joined}</span>
            </>
          )}
        </div>
      </div>
      <div className="profile-hero-actions">
        <button className="btn btn-secondary btn-sm" type="button">
          <I.Eye /> View public profile
        </button>
      </div>
    </div>
  );
}
