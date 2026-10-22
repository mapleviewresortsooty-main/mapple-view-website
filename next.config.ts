import os from "node:os";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

// Local Cloudflare bindings (Miniflare/workerd) — only for `next dev`.
// workerd requires macOS 13.5+; on older Macs its binary is killed at exec
// and takes the dev server down with it, so skip the init entirely there.
// (Darwin 22.6 = macOS 13.5; release() lower than that means workerd can't run.)
const workerdSupported =
  process.platform !== "darwin" ||
  (() => {
    const [major, minor] = os.release().split(".").map(Number);
    return major > 22 || (major === 22 && minor >= 6);
  })();

if (process.env.NODE_ENV === "development" && workerdSupported) {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}
