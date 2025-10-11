import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isValidToken = token && token !== "undefined";

  // Jika belum login & bukan di halaman Login → redirect ke Login
  if (!isValidToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/Login", req.url));
  }

  // Jika sudah login & mencoba akses Login → redirect ke Dashboard
  if (isValidToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Jika sudah login & mencoba akses root "/" → redirect ke Dashboard
  if (isValidToken && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // batasi hanya ke route yang perlu dijaga
  matcher: ["/", "/dashboard/:path*", "/login"],

};
