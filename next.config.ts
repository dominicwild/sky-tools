import type { NextConfig } from "next";
import { SKY_IMAGES_PATH } from "./util/helper";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: `${SKY_IMAGES_PATH}/:file`,
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
