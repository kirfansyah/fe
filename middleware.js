import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value; // ✅ ambil value token
  const url = req.nextUrl.clone();

  // 🚪 Kalau sudah login tapi masih buka /auth/login → arahkan ke /profile/personal
  if (url.pathname.startsWith("/auth/login") && token) {
    return NextResponse.redirect(new URL("/profile/personal", req.url));
  }

  // 🚪 Kalau buka halaman yang butuh login tapi belum ada token → arahkan ke /auth/login
  if ((url.pathname.startsWith("/profile") || url.pathname.startsWith("/resume") || url.pathname.startsWith("/admin")) && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🚪 Kalau ke root "/" → arahkan sesuai status login
  if (url.pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/profile/personal", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/login", "/profile/:path*", "/resume/:path*", "/admin/:path*"],
};
