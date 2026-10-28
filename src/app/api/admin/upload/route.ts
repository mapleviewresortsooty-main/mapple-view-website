import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WEBP, or GIF images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const key = `${crypto.randomUUID()}${EXT_BY_TYPE[file.type]}`;

  await env.UPLOADS_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({ url: `/uploads/${key}` });
}

/** Removes an uploaded object from the R2 bucket (e.g. when an image is
 *  deleted from a site section or room). Accepts { url: "/uploads/<key>" }. */
export async function DELETE(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
  } | null;
  const url = typeof body?.url === "string" ? body.url : "";
  if (!url.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Not an uploaded image" }, { status: 400 });
  }
  const key = decodeURIComponent(url.slice("/uploads/".length));
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Invalid image key" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.UPLOADS_BUCKET.delete(key);
  return NextResponse.json({ ok: true });
}
