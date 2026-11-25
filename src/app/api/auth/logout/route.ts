import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/auth/login", request.url);
  const response = NextResponse.redirect(url);

  // Clear cookie completely
  response.cookies.delete("gvk_auth_session");
  response.cookies.set("gvk_auth_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
