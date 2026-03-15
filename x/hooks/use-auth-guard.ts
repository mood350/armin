"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

/**
 * Décode le JWT et retourne la date d'expiration
 */
function getTokenExpiry(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp ? payload.exp * 1000 : null; // en ms
    } catch {
        return null;
    }
}

/**
 * Hook qui surveille l'expiration du token JWT.
 * → Déconnecte automatiquement l'utilisateur quand le token expire.
 * → Vérifie toutes les 30 secondes.
 */
export function useAuthGuard() {
    const { accessToken, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;

        const checkExpiry = () => {
            const expiry = getTokenExpiry(accessToken);

            if (!expiry) {
                logout();
                router.push("/login");
                return;
            }

            const now = Date.now();
            const timeLeft = expiry - now;

            // Token expiré → déconnexion immédiate
            if (timeLeft <= 0) {
                logout();
                router.push("/login?reason=expired");
                return;
            }

            // Token expire dans moins de 2 minutes → on tente le refresh
            if (timeLeft < 2 * 60 * 1000) {
                refreshAccessToken();
            }
        };

        const refreshAccessToken = async () => {
            try {
                const { refreshToken, setTokens } = useAuthStore.getState();
                if (!refreshToken) throw new Error("No refresh token");

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${refreshToken}` },
                    }
                );

                if (!response.ok) throw new Error("Refresh failed");

                const data = await response.json();
                setTokens(data.access_token, data.refresh_token);
            } catch {
                // Refresh échoué → déconnexion
                logout();
                router.push("/login?reason=expired");
            }
        };

        // Vérification immédiate
        checkExpiry();

        // Vérification toutes les 30 secondes
        const interval = setInterval(checkExpiry, 30 * 1000);

        return () => clearInterval(interval);
    }, [accessToken, isAuthenticated, logout, router]);
}