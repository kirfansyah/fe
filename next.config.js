const runtimeCaching = require("next-pwa/cache");
const isProd = process.env.NODE_ENV === "production";

const withPWA = require("next-pwa")({
  disable: !isProd, // disabled pwa jika masih development
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

module.exports = withPWA({
  env: {
    appName: "LMS SAMBU GROUP",
    // API_URL: "http://192.168.12.73:5000/api",
    API_URL: "https://melvina-thiolacetic-herschel.ngrok-free.dev/api",
  },
  async rewrites() {
    //konfigurasi Router
    return [
      {
        source: "/auth/login", // custom route/page
        destination: "/login", // route/page asalnya
      },
      {
        // source: "/api/v1/:path*", // route untuk api backend agar tidak kena cors
        // destination: `${process.env.API_URL}/:path*`, // server api backend asal

        source: "/proxy/:path*",
        destination:
          "https://melvina-thiolacetic-herschel.ngrok-free.dev/api/:path*",
      },
    ];
  },
});
