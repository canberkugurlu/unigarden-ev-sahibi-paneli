import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-evsahibi-jwt-gizli-2024"
);
export const COOKIE = "ev_sahibi_token";

export interface EvSahibiPayload {
  id: string;
  ad: string;
  soyad: string;
  email: string;
}

export async function signToken(payload: EvSahibiPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<EvSahibiPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as EvSahibiPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<EvSahibiPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
