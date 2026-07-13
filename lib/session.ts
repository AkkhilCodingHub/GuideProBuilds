import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

/**
 * Gets the current session ID from cookies. If no session ID exists,
 * generates a new UUID, sets it as a secure cookie, and returns it.
 */
export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }
  return sessionId;
}
