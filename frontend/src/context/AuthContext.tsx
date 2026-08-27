import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { API_BASE_URL } from "../services/api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithToken: (token: string, userId?: string) => Promise<void>;
  demoLogin: (email?: string, name?: string) => Promise<User>;
  googleLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("reachinbox_token"));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("reachinbox_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to parse JWT payload safely
  const parseJwt = (jwtToken: string) => {
    try {
      const base64Url = jwtToken.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const fetchUserProfile = useCallback(async (authToken: string, userIdHint?: string) => {
    try {
      const payload = parseJwt(authToken);
      const userId = userIdHint || payload?.userId || payload?.id;
      
      if (userId) {
        const res = await api.get(`/api/users/${userId}`);
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("reachinbox_user", JSON.stringify(res.data.user));
          return res.data.user;
        }
      } else if (payload?.email) {
        // Fallback user construct if get fails
        const fallbackUser: User = {
          id: payload.userId || "user_demo",
          email: payload.email,
          name: payload.name || payload.email.split("@")[0],
          avatarUrl: payload.avatarUrl,
        };
        setUser(fallbackUser);
        localStorage.setItem("reachinbox_user", JSON.stringify(fallbackUser));
        return fallbackUser;
      }
    } catch (err) {
      console.warn("[Auth] Failed to fetch full user profile, using decoded token data:", err);
      const payload = parseJwt(authToken);
      if (payload?.email) {
        const fallbackUser: User = {
          id: payload.userId || userIdHint || "user_active",
          email: payload.email,
          name: payload.name || payload.email.split("@")[0],
        };
        setUser(fallbackUser);
        localStorage.setItem("reachinbox_user", JSON.stringify(fallbackUser));
        return fallbackUser;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("reachinbox_token");
      if (storedToken) {
        setToken(storedToken);
        await fetchUserProfile(storedToken);
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUserProfile]);

  const loginWithToken = async (newToken: string, userId?: string) => {
    localStorage.setItem("reachinbox_token", newToken);
    setToken(newToken);
    await fetchUserProfile(newToken, userId);
  };

  const demoLogin = async (email = "demo@reachinbox.com", name = "Demo User"): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/demo", { email, name });
      const { token: newToken, user: userData } = res.data;
      if (newToken) {
        localStorage.setItem("reachinbox_token", newToken);
        setToken(newToken);
      }
      if (userData) {
        localStorage.setItem("reachinbox_user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      return {
        id: "demo_user",
        email,
        name,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("reachinbox_token");
    localStorage.removeItem("reachinbox_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        loginWithToken,
        demoLogin,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
