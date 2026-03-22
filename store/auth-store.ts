import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    role: string | null;
    setTokens: (access: string, refresh: string) => void;
    logout: () => void;
}

const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
};

const deleteCookie = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

// Decode JWT payload sans librairie
const decodeJwt = (token: string): Record<string, unknown> | null => {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

const extractRole = (token: string): string | null => {
    const payload = decodeJwt(token);
    if (!payload) return null;
    // Spring Security met les rôles dans "authorities" ou "roles"
    const authorities = payload.authorities as string[] | undefined;
    const roles = payload.roles as string[] | undefined;
    const arr = authorities ?? roles ?? [];
    if (arr.includes("ADMIN")) return "ADMIN";
    if (arr.includes("USER")) return "USER";
    return null;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            role: null,

            setTokens: (access, refresh) => {
                setCookie("access_token", access, 1);
                setCookie("refresh_token", refresh, 7);
                const role = extractRole(access);
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true,
                    role,
                });
            },

            logout: () => {
                deleteCookie("access_token");
                deleteCookie("refresh_token");
                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    role: null,
                });
            },
        }),
        { name: "armin-auth" }
    )
);