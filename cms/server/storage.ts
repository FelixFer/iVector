import { createHash, randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { CmsError, type CmsStorage } from "./api";

export async function prepareImage(bytes: Uint8Array) {
  if (!bytes.length || bytes.length > 5242880) throw new CmsError(422, "Choose an image no larger than 5 MB.");
  try {
    const image = sharp(bytes, { limitInputPixels: 4096 * 4096, failOn: "error" });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || !metadata.width || !metadata.height || metadata.width > 4096 || metadata.height > 4096 || (metadata.pages ?? 1) > 1) throw new Error();
    const { data, info } = await image.rotate().webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    if (data.length > 5242880) throw new Error();
    return { bytes: data, width: info.width, height: info.height, size: data.length, sha256: createHash("sha256").update(data).digest("hex") };
  } catch { throw new CmsError(422, "Use a valid, still PNG, JPEG, or WebP image up to 4096 × 4096 pixels."); }
}

export function createStorage(client: S3Client, bucket: string): CmsStorage {
  if (!bucket) throw new Error("Set CMS_BUCKET.");
  return {
    upload: async bytes => {
      const image = await prepareImage(bytes);
      const id = randomUUID(), key = `images/${id}.webp`;
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: image.bytes, ContentType: "image/webp", CacheControl: "private, no-store" }));
      return { id, key, mime: "image/webp", width: image.width, height: image.height, size: image.size, sha256: image.sha256 };
    },
    preview: asset => getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: asset.key, ResponseCacheControl: "private, no-store" }), { expiresIn: 120 }),
    remove: async asset => { await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: asset.key })); },
  };
}
