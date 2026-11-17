import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  functions: {
    ivectorcms: {
      name: "iVector CMS",
      source: ".cms/function",
      bundler: "none",
      env: {
        CMS_DATABASE_URL: { value: process.env.CMS_DATABASE_URL, required: true },
        CMS_OWNER_ID: { value: process.env.CMS_OWNER_ID, required: true },
        CMS_ALLOWED_ORIGINS: { value: process.env.CMS_ALLOWED_ORIGINS, required: true },
        CMS_BUCKET: { value: process.env.CMS_BUCKET, required: true },
      },
    },
  },
});
