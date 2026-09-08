"use client";

import { useCallback, useState } from "react";
import { useProfiles } from "../../context/ProfileContext.jsx";

// Shared by the picker and the account section so both surfaces set the
// default through one code path and adopt the same re-read graph.
export function useSetDefault() {
  const { accessToken, applyGraph } = useProfiles();
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(null);

  const setDefault = useCallback(
    async (profileId) => {
      setPendingId(profileId);
      setError(null);
      try {
        const res = await fetch("/api/linked-accounts/default", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ profileId }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
        // The server returns the re-read graph, so the badge and the ordering
        // both come from what was stored.
        applyGraph(body.graph);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setPendingId(null);
      }
    },
    [accessToken, applyGraph],
  );

  return { setDefault, pendingId, error };
}
