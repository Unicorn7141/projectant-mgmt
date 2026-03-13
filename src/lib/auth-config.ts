export const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me");

export const DEFAULT_PASSWORD =
  process.env.DEFAULT_TEMP_PASSWORD || "Aa1234567";

export function assertJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return JWT_SECRET;
}
