"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_META, type Category, type Spot } from "@/lib/spots";

function defaultCaption(category: Category) {
  switch (category) {
    case "tourism":
      return "ずっと気になってた景色、実際に見てみたい。";
    case "gourmet":
      return "食べログでは分からない、ここのご飯が気になる。";
    case "hidden":
      return "まだあまり知られてないけど、良さそうな場所を見つけた。";
    case "trend":
      return "あのシーンのロケ地、聖地巡礼してきたい。";
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  let cy = y;
  for (const char of text) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, cy);
      line = char;
      cy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, cy);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function ShareCard({ spot }: { spot: Spot }) {
  const [caption, setCaption] = useState(() => defaultCaption(spot.category));
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [renderedSpotId, setRenderedSpotId] = useState(spot.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (spot.id !== renderedSpotId) {
    setRenderedSpotId(spot.id);
    setCaption(defaultCaption(spot.category));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const meta = CATEGORY_META[spot.category];
    const W = 600;
    const H = 1040;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = meta.markerColor;
    ctx.fillRect(0, 0, W, H * 0.6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    ctx.fillStyle = "#111111";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(spot.name, 32, H * 0.6 + 56);

    ctx.fillStyle = "#666666";
    ctx.font = "20px sans-serif";
    ctx.fillText(spot.area, 32, H * 0.6 + 90);

    ctx.fillStyle = "#111111";
    ctx.font = "22px sans-serif";
    wrapText(ctx, caption, 32, H * 0.6 + 132, W - 64, 30);

    ctx.fillStyle = meta.markerColor;
    roundRect(ctx, 32, H - 74, 96, 34, 17);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.fillText(meta.label, 54, H - 51);

    ctx.fillStyle = "#999999";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("行きたいマップ", W - 32, H - 51);
    ctx.textAlign = "left";
  }, [spot, caption]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spot.name}.png`;
    a.click();
  };

  const shareOnX = () => {
    const text = `${caption}\n#行きたいマップ #${spot.name}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(`${caption}\n#行きたいマップ #${spot.name}`);
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 1500);
  };

  return (
    <div className="flex flex-wrap gap-5">
      <canvas ref={canvasRef} className="h-[260px] w-[150px] flex-shrink-0 rounded-lg border border-neutral-200 object-cover" />
      <div className="flex min-w-[220px] flex-1 flex-col gap-2">
        <label className="text-xs text-neutral-600">キャプション（編集すると画像に反映されます）</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-900"
        />
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            onClick={shareOnX}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900"
          >
            Xでシェア
          </button>
          <button
            onClick={downloadImage}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900"
          >
            画像を保存
          </button>
          <button
            onClick={copyCaption}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900"
          >
            {copyStatus === "copied" ? "コピーしました" : "キャプションをコピー"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Instagramは投稿の事前入力ができないため、「画像を保存」してアプリから投稿してください。
        </p>
      </div>
    </div>
  );
}
