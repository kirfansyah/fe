// const runtimeCaching = require("next-pwa/cache");
// const isProd = process.env.NODE_ENV === "production";

// const withPWA = require("next-pwa")({
//   disable: !isProd, // disabled pwa jika masih development
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   runtimeCaching,
// });

// module.exports = withPWA({
//   env: {
//     appName: "LMS SAMBU GROUP",
//   },
//   async rewrites() {
//     //konfigurasi Router
//     return [
//       {
//         source: "/auth/login", // custom route/page
//         destination: "/login", // route/page asalnya
//       },
//       {
//         source: "/api/v1/:path*", // route untuk api backend agar tidak kena cors
//         destination: `${process.env.API_URL}/:path*`, // server api backend asal
//       },
//     ];
//   },
// });

const runtimeCaching = require("next-pwa/cache");
const isProd = process.env.NODE_ENV === "production";

const withPWA = require("next-pwa")({
  disable: !isProd,
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/pdf\.worker\.js$/], // jangan cache pdf.worker.js
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  env: {
    appName: "LMS SAMBU GROUP",
  },

  async rewrites() {
    return [
      {
        source: "/auth/login",
        destination: "/login",
      },
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },

  // 🔥 FIX DOMMatrix is not defined (react-pdf + Next 15 Webpack)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // cegah react-pdf dan pdfjs-dist dievaluasi di server
      config.externals.push({
        canvas: "canvas",
        "react-pdf": "react-pdf",
        "pdfjs-dist": "pdfjs-dist",
      });
    }

    return config;
  },
});
