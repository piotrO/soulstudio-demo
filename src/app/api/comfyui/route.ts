import { NextResponse } from "next/server";
import workflow from "../../../../comfyui-workflow.json";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;
const RUNPOD_BASE = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${RUNPOD_API_KEY}`,
};

// Poll for job completion (handles cold starts that can take 1-2 min)
async function pollForResult(jobId: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000)); // wait 3s between polls

    const res = await fetch(`${RUNPOD_BASE}/status/${jobId}`, { headers });
    const data = await res.json();

    if (data.status === "COMPLETED") return data;
    if (data.status === "FAILED") throw new Error(JSON.stringify(data));

    console.log(
      `[RunPod] Job ${jobId} status: ${data.status} (attempt ${i + 1})`,
    );
  }

  throw new Error("Job timed out after 3 minutes");
}

export async function POST(req: Request) {
  const { prompt, seed } = await req.json();

  // Deep clone the workflow so we can inject dynamic values
  const wf = JSON.parse(JSON.stringify(workflow));

  // Inject the prompt (node 7 = positive prompt)
  wf["7"].inputs.text =
    `(raw photo, candid phone quality, messy room:1.2), ${prompt}`;

  // Inject the seed (node 11 = KSampler)
  wf["11"].inputs.seed = seed || Math.floor(Math.random() * 1000000);

  try {
    // Submit job (async — returns immediately with a job ID)
    const runRes = await fetch(`${RUNPOD_BASE}/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({ input: { workflow: wf } }),
    });

    const runData = await runRes.json();
    console.log(`[RunPod] Job submitted: ${runData.id}`);

    // Poll until complete (handles cold starts)
    const result = await pollForResult(runData.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("RunPod Error:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error?.message },
      { status: 500 },
    );
  }
}
