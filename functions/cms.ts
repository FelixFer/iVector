import { Pool } from "pg";
import { S3Client } from "@aws-sdk/client-s3";
import { createRemoteJWKSet } from "jose";
import { createCmsHandler } from "../cms/server/api";
import { createTokenVerifier } from "../cms/server/auth";
import { createRepository } from "../cms/server/repository";
import { createStorage } from "../cms/server/storage";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name}.`);
  return value;
}

let handler: ReturnType<typeof createCmsHandler> | undefined;
const cmsFunction = {
  async fetch(request: Request) {
    if (!handler) {
      const jwks = createRemoteJWKSet(new URL(required("NEON_AUTH_JWKS_URL")));
      const issuer = new URL(required("NEON_AUTH_BASE_URL")).origin;
      const pool = new Pool({ connectionString: required("CMS_DATABASE_URL"), max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, statement_timeout: 10000, query_timeout: 15000 });
      const client = new S3Client({ region: process.env.CMS_STORAGE_REGION ?? process.env.AWS_REGION ?? "ap-southeast-1", endpoint: process.env.CMS_STORAGE_ENDPOINT ?? process.env.AWS_ENDPOINT_URL_S3, forcePathStyle: true, credentials: process.env.CMS_STORAGE_ACCESS_KEY_ID ? { accessKeyId: required("CMS_STORAGE_ACCESS_KEY_ID"), secretAccessKey: required("CMS_STORAGE_SECRET_ACCESS_KEY") } : undefined });
      handler = createCmsHandler({
        repository: createRepository(pool),
        storage: createStorage(client, process.env.CMS_STORAGE_BUCKET ?? required("CMS_BUCKET")),
        ownerId: required("CMS_OWNER_ID"),
        allowedOrigins: required("CMS_ALLOWED_ORIGINS").split(",").map(origin => new URL(origin.trim()).origin),
        verifyToken: createTokenVerifier(jwks, issuer),
      });
    }
    return handler(request);
  },
};
export default cmsFunction;
