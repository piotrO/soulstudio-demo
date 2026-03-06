import { fal } from "@fal-ai/client";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt, seed } = await req.json();

  try {
    const result = await fal.subscribe("fal-ai/flux-2/klein/9b/base/lora", {
      input: {
        prompt: `(raw photo, candid phone quality, messy room:1.2), ${prompt}`,
        loras: [
          {
            path: "https://v3b.fal.media/files/b/0a90c5ef/CNUXMfH7YbMQbj9rmCeDS_lenovo_flux_klein9b.safetensors",
            scale: 0.6,
          },
          {
            path: "https://v3b.fal.media/files/b/0a90c6d9/U7hKk611_n_YPIXKIycAV_nicegirls_flux_klein9b.safetensors",
            scale: 0.6,
          },
          {
            path: "https://v3b.fal.media/files/b/0a90c722/qUwQpealTDOwlMXGbYW92_klein_snofs_v1_1.safetensors",
            scale: 0.6,
          },
        ],
        seed: seed || Math.floor(Math.random() * 1000000),
        enable_safety_checker: false,
        guidance_scale: 4.5, // Bumped up to let the LoRA influence the output more
        num_inference_steps: 28,
        image_size: "portrait_4_3",
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("FAL Error:", JSON.stringify(error?.body || error, null, 2));
    return NextResponse.json(
      { error: "Failed to generate image", details: error?.body },
      { status: 500 },
    );
  }
}
