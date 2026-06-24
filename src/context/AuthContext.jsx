import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getDeviceId, setToken } from "../lib/api.js";

const USER_KEY = "sibsAcademyUser";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const data = await apiFetch("/auth/me");
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function login({ username, password }) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        deviceId: getDeviceId(),
        deviceName: `${navigator.platform || "Device"} - ${navigator.userAgent?.split(" ")?.[0] || "Browser"}`,
      }),
    });

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshMe, isAdmin: user?.role === "admin" }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
