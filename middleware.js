import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isValidToken = token && token !== "undefined";

  // Jika belum login & bukan di halaman Login → redirect ke Login
  if (!isValidToken && pathname !== "/Login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Jika sudah login & mencoba akses Login → redirect ke Home
  if (isValidToken && pathname === "/Login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [],
};
