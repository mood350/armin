import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname), // ← force la bonne racine
    },
};

export default nextConfig;