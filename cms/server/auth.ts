import { jwtVerify, type JWTVerifyGetKey } from "jose";

export function createTokenVerifier(jwks: JWTVerifyGetKey, issuer: string) {
  return async (token: string): Promise<string> => {
    const { payload } = await jwtVerify(token, jwks, { issuer, algorithms: ["EdDSA"], requiredClaims: ["exp", "sub", "iat"] });
    if (!payload.sub) throw new Error("Missing subject.");
    return payload.sub;
  };
}
