"use client";

import { useState, useEffect } from "react";
import { CurrentUser } from "@/types/domain";

// Module-level cache so a single fetch is shared across all hook consumers in the same page load
let cachedUser: CurrentUser | null | undefined = undefined;
const listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Reads the authenticated user from the server session cookie via /api/auth/session.
 * Returns the full CurrentUser object (id, role, fullName, identifierCode, email).
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(cachedUser);
  const [loading, setLoading] = useState(cachedUser === undefined);

  useEffect(() => {
    const update = () => setUser(cachedUser);
    listeners.push(update);

    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => {
        cachedUser = data.user ?? null;
        setUser(cachedUser);
        setLoading(false);
      })
      .catch(() => {
        cachedUser = null;
        setUser(null);
        setLoading(false);
      });

    return () => {
      const idx = listeners.indexOf(update);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return { user, loading };
}

/** Call this to clear the in-memory cache (e.g. after logout/login transitions) */
export function clearUserCache() {
  cachedUser = undefined;
  notifyListeners();
}
