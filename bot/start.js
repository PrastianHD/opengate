// Bot startup — load env first, then import bot.
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

// Dynamic import so env vars are loaded before bot code
await import("./index.js");
