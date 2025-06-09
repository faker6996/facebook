// lib/utils/jwt.ts
import jwt, { SignOptions, Secret } from "jsonwebtoken";

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = process.env;

export interface JwtPayload {
  id: number;
  email?: string;
  name?: string;
  [key: string]: any;
}

export function signJwt(payload: JwtPayload, expiresIn: string = "1h"): string {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET env var");
  }

  const secret: Secret = JWT_SECRET;

  const options = {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn,
    jwtid: payload.sub,
  } as jwt.SignOptions;

  return jwt.sign(payload, secret, options);
}

export function verifyJwt(token: string): JwtPayload {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET env var");
  }

  try {
    return jwt.verify(token, JWT_SECRET as Secret, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JwtPayload;
  } catch (err: any) {
    throw new Error(`Invalid or expired token: ${err.message}`);
  }
}
