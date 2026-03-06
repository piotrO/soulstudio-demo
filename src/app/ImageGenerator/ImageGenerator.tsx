"use client";

import { useState } from "react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState<number | "">("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/comfyui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          seed: seed === "" ? undefined : Number(seed),
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Generation failed");

      // fal-ai returns images as an array with url properties
      const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
      if (imageUrl) {
        setImage(imageUrl);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-zinc-900 text-white rounded-xl border border-zinc-800 shadow-2xl">
      <header className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Flux LoRA Lab</h2>
        <p className="text-sm text-zinc-400">
          Enter a prompt to trigger the "Amateur" LoRAs.
        </p>
      </header>

      <form onSubmit={generateImage} className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-uppercase font-bold text-zinc-500 tracking-wider">
            PROMPT
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A woman sitting in a coffee shop..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
            required
          />
        </div>

        {/* Seed Input */}
        <div className="space-y-2">
          <label className="text-xs font-uppercase font-bold text-zinc-500 tracking-wider">
            SEED (OPTIONAL)
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) =>
              setSeed(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Random"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt}
          className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating Magic..." : "Generate Image"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result Display */}
      <div className="relative aspect-[4/3] w-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt="Generated output"
            className="object-cover w-full h-full animate-in fade-in duration-700"
          />
        ) : loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm animate-pulse">
              Running LoRAs...
            </p>
          </div>
        ) : (
          <p className="text-zinc-600 text-sm italic">Image will appear here</p>
        )}
      </div>
    </div>
  );
}
