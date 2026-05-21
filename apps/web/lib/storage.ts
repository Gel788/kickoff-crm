import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type StoredFile = {
  url: string;
  storage: "local" | "s3";
};

export async function storeUpload(
  relativeKey: string,
  bytes: Buffer,
  contentType = "application/octet-stream",
): Promise<StoredFile> {
  const key = relativeKey.replace(/^\//, "");

  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    });
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    const publicBase =
      process.env.S3_PUBLIC_URL ??
      `${(process.env.S3_ENDPOINT ?? "").replace(/\/$/, "")}/${process.env.S3_BUCKET}`;
    return { url: `${publicBase}/${key}`, storage: "s3" };
  }

  const rel = `/uploads/${key}`;
  const full = path.join(process.cwd(), "public", rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  return { url: rel, storage: "local" };
}
