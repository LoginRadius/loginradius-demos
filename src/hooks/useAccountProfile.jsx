import { createContext, useContext, useEffect, useState } from "react";
import { useLoginRadiusSDK, useLRAuth } from "@loginradius/loginradius-react-sdk";
import { useSessionGuard } from "./useSessionGuard.jsx";

const AccountProfileContext = createContext({ profileData: null, loading: false });

export function AccountProfileProvider({ children }) {
  const { lrInstance } = useLoginRadiusSDK();
  const { accessToken } = useLRAuth();
  const { handleError } = useSessionGuard();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lrInstance || !accessToken) return;
    let cancelled = false;
    setLoading(true);
    const fetchAccount = async () => {
      try {
        const res = await lrInstance?.controller?.getAccount?.(accessToken);
        if (cancelled) return;
        if (res?.success && res?.data) {
          setProfileData(res.data);
        } else if (res && res.success === false) {
          handleError(res.error || res);
        }
      } catch (err) {
        if (!handleError(err)) console.warn("Failed to fetch account profile:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAccount();
    return () => {
      cancelled = true;
    };
  }, [lrInstance, accessToken, handleError]);

  return (
    <AccountProfileContext.Provider value={{ profileData, loading }}>
      {children}
    </AccountProfileContext.Provider>
  );
}

export function useAccountProfile() {
  return useContext(AccountProfileContext);
}
