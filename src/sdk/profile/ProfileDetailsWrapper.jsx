// Wraps the SDK's ProfileDetailsComponent. Renders the supplied `fallback`
// (mock UI) when USE_SDK is off or the widget fails to mount.
import { makeProfileWrapper } from "./_factory.jsx";

export const ProfileDetailsWrapper = makeProfileWrapper("ProfileDetailsComponent");
