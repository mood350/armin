import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081",
    headers: {
        "Content-Type": "application/json",
    },
});

// Fonction utilitaire pour lire le token depuis Zustand persist
const getTokens = () => {
    if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
    try {
        const stored = localStorage.getItem("armin-auth");
        if (!stored) return { accessToken: null, refreshToken: null };
        const parsed = JSON.parse(stored);
        return {
            accessToken: parsed?.state?.accessToken ?? null,
            refreshToken: parsed?.state?.refreshToken ?? null,
        };
    } catch {
        return { accessToken: null, refreshToken: null };
    }
};

// Intercepteur requête — ajoute le token JWT automatiquement
api.interceptors.request.use((config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Intercepteur réponse — refresh token si 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { refreshToken } = getTokens();
                if (!refreshToken) throw new Error("No refresh token");

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
                    {},
                    { headers: { Authorization: `Bearer ${refreshToken}` } }
                );

                const newAccessToken = response.data.access_token;

                // Met à jour le token dans le store Zustand persist
                const stored = localStorage.getItem("armin-auth");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.state.accessToken = newAccessToken;
                    localStorage.setItem("armin-auth", JSON.stringify(parsed));
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch {
                // Refresh token expiré → déconnexion
                localStorage.removeItem("armin-auth");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;