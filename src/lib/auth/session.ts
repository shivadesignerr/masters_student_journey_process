import { cookies } from "next/headers";
import { CurrentUser } from "@/types/domain";

const SESSION_COOKIE_NAME = "gvk_auth_session";

export async function setSession(user: CurrentUser) {
  try {
    const cookieStore = cookies();
    const sessionData = JSON.stringify(user);

    cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (err) {
    console.error("Failed to set session cookie:", err);
  }
}

export async function getSession(): Promise<CurrentUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const user: CurrentUser = JSON.parse(sessionCookie.value);
    return user;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    // Explicit expiration header to enforce immediate browser eviction
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  } catch {
    // In environments where cookies cannot be mutated directly, fail silently
  }
}
