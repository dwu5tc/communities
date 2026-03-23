import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Communities — Universal Comments",
    description: "Comment on any webpage. Highlight text to anchor comments.",
    permissions: ["activeTab", "storage", "sidePanel"],
  },
});
