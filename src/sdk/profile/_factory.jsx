// Shared factory for profile SDK wrappers.
//
// Each profile section's SDK widget is:
//   1. Lazy-imported from @loginradius/loginradius-react (code-split into
//      its own chunk so users who never open Profile don't pay the SDK cost).
//   2. Guarded by SDKBoundary — if the widget throws, the mock fallback renders.
//   3. Bypassed entirely when USE_SDK is false (set VITE_USE_SDK="false").
//
// The same callback contract used by the rest of the app is preserved here
// (onSuccess / onError / fallback), so page-level code looks identical
// regardless of mode.

import { lazy, Suspense } from "react";
import { USE_SDK } from "../../config/features.js";
import { SDKBoundary } from "../SDKBoundary.jsx";
import { useSessionGuard } from "../../hooks/useSessionGuard.jsx";

const lazyProfileWidget = (exportName) =>
  lazy(() =>
    import("@loginradius/loginradius-react").then((mod) => {
      const Widget = mod[exportName];
      if (typeof Widget !== "function") {
        throw new Error(`SDK widget "${exportName}" is not exported`);
      }
      return { default: Widget };
    }),
  );

export function makeProfileWrapper(exportName) {
  const LazyWidget = lazyProfileWidget(exportName);

  return function ProfileSDKWrapper({ fallback, suspenseFallback, onError, ...props }) {
    const { handleError } = useSessionGuard();
    const guardedOnError = (err) => {
      handleError(err);
      onError?.(err);
    };
    if (!USE_SDK) return fallback ?? null;
    return (
      <SDKBoundary fallback={fallback} onError={guardedOnError}>
        <Suspense fallback={suspenseFallback ?? fallback ?? null}>
          <LazyWidget {...props} onError={guardedOnError} />
        </Suspense>
      </SDKBoundary>
    );
  };
}
