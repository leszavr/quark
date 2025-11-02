import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Настройки для лучшей работы с Google Fonts
  experimental: {
  // optimizePackageImports: ["@chakra-ui/react"], // удалено, не поддерживается в Next.js 13
  },
  
  // Настройки сети
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ...existing code...
  
  // Headers для лучшей загрузки шрифтов
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;