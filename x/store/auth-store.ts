import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
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

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setTokens: (access, refresh) => {
                setCookie("access_token", access, 1);
                setCookie("refresh_token", refresh, 7);
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                deleteCookie("access_token");
                deleteCookie("refresh_token");
                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },
        }),
        { name: "armin-auth" }
    )
);