import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";

// First, download the LoRA from CivitAI manually to ./lora.safetensors
// Then run this script to upload it to fal.ai storage

const loraPath = process.argv[2];

if (!loraPath) {
  console.error("Usage: node scripts/upload-lora.mjs <path-to-lora-file>");
  console.error("Example: node scripts/upload-lora.mjs ./lora.safetensors");
  process.exit(1);
}

const file = new File(
  [fs.readFileSync(path.resolve(loraPath))],
  path.basename(loraPath),
);

console.log(`Uploading ${loraPath} to fal.ai storage...`);
const url = await fal.storage.upload(file);
console.log("\n✅ Upload complete!");
console.log("Use this URL in your loras config:");
console.log(url);
