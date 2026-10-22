import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  _request: Request,
  context: RouteContext<"/uploads/[key]">
) {
  const { key } = await context.params;
  const { env } = await getCloudflareContext({ async: true });

  const object = await env.UPLOADS_BUCKET.get(key);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: object.httpEtag,
    },
  });
}
