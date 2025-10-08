import { config } from "@del-wang/config/tsdown";
import { defineConfig } from "tsdown";

export default defineConfig({
	...config,
	platform: "browser",
	entry: ["./index.tsx"],
});
