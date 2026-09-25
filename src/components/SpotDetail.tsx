"use client";

import { useState } from "react";
import { CATEGORY_META, SOURCE_LABELS, type Spot } from "@/lib/spots";
import { getMemo, setMemo } from "@/lib/storage";

export default function SpotDetail({
  spot,
  allSpots,
  liked,
  onToggleLike,
  onAddComment,
  onShare,
  onJumpTo,
}: {
  spot: Spot;
  allSpots: Spot[];
  liked: boolean;
  onToggleLike: (id: number) => void;
  onAddComment: (id: number, text: string) => void;
  onShare: (id: number) => void;
  onJumpTo: (id: number) => void;
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [memoSpotId, setMemoSpotId] = useState(spot.id);
  const [memoText, setMemoText] = useState(() => getMemo(spot.id));
  const meta = CATEGORY_META[spot.category];

  if (spot.id !== memoSpotId) {
    setMemoSpotId(spot.id);
    setMemoText(getMemo(spot.id));
  }

  const related =
    spot.workId ? allSpots.filter((s) => s.workId === spot.workId && s.id !== spot.id) : [];
  const hasExpandableDetail = Boolean(spot.workTitle || spot.celebrity || spot.review);

  const submitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(spot.id, commentText.trim());
    setCommentText("");
  };

  const handleMemoChange = (text: string) => {
    setMemoText(text);
    setMemo(spot.id, text);
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md text-sm font-medium"
          style={{ backgroundColor: meta.markerColor + "1a", color: meta.markerColor }}
        >
          {meta.label.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-medium text-neutral-900">{spot.name}</h2>
          <p className="text-sm text-neutral-600">{spot.area}</p>
        </div>
      </div>

      {spot.sourceLabel && !hasExpandableDetail && (
        <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs text-red-800">
          {spot.sourceType && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px]">{SOURCE_LABELS[spot.sourceType]}</span>
          )}
          {spot.sourceLabel}
        </span>
      )}

      {spot.sourceLabel && hasExpandableDetail && (
        <button
          onClick={() => setSourceOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs text-red-800"
        >
          {spot.sourceType && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px]">{SOURCE_LABELS[spot.sourceType]}</span>
          )}
          {spot.sourceLabel}
          <span>{sourceOpen ? "▲" : "▼"}</span>
        </button>
      )}

      {sourceOpen && hasExpandableDetail && (
        <div className="mt-2 rounded-md bg-neutral-100 p-3 text-sm leading-relaxed text-neutral-800">
          {(spot.sourceType === "drama" || spot.sourceType === "anime") && (
            <>
              <div className="font-medium text-neutral-900">{spot.workTitle}</div>
              <div className="mt-0.5 text-neutral-600">{spot.broadcastInfo}</div>
              <div className="mt-2">{spot.statLine}</div>
              {related.length > 0 && (
                <>
                  <div className="mt-3 text-neutral-600">この作品の他の行きたい場所（{related.length}）</div>
                  <div className="mt-1 flex flex-col gap-1">
                    {related.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onJumpTo(r.id)}
                        className="rounded-md bg-white px-2 py-1.5 text-left text-neutral-900 hover:bg-neutral-200"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {spot.sourceType === "celebrity" && spot.celebrity && (
            <>
              <div className="font-medium text-neutral-900">{spot.celebrity.handle}</div>
              <div className="mt-0.5 text-neutral-600">
                フォロワー {spot.celebrity.followers} ・ {spot.celebrity.postDate}に投稿
              </div>
              <div className="mt-2 italic">「{spot.celebrity.quote}」</div>
            </>
          )}
          {spot.sourceType === "review" && spot.review && (
            <>
              <div>累計 {spot.review.mentionCount}件の投稿で言及</div>
              <div className="mt-0.5 text-neutral-600">
                初出: {spot.review.firstMentioned} ／ {spot.review.platforms}
              </div>
            </>
          )}
        </div>
      )}

      {spot.description && <p className="mt-3 text-sm leading-relaxed text-neutral-900">{spot.description}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onToggleLike(spot.id)}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
            liked ? "border-red-200 bg-red-50 text-red-800" : "border-neutral-300 bg-white text-neutral-900"
          }`}
        >
          行きたい（{spot.likes}）
        </button>
        <button
          onClick={() => onShare(spot.id)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900"
        >
          シェア画像を作る
        </button>
      </div>

      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-sm font-medium text-amber-900">自分だけのメモ</span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">非公開</span>
        </div>
        <textarea
          value={memoText}
          onChange={(e) => handleMemoChange(e.target.value)}
          rows={2}
          placeholder="例: 〇〇さんに勧められた。次の連休に行く。"
          className="w-full rounded-md border border-amber-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-amber-700/50"
        />
        <p className="mt-1.5 text-xs text-amber-800">このメモはあなたのブラウザにだけ保存され、他の人には表示されません。</p>
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-3">
        <div className="mb-2 text-sm font-medium text-neutral-700">コメント（公開・{spot.comments.length}）</div>
        <div className="flex flex-col gap-2.5">
          {spot.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-800">
                {c.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900">{c.name}</span>
                  <span className="text-xs text-neutral-500">{c.time}</span>
                </div>
                <div className="text-sm leading-relaxed text-neutral-900">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder="コメントを書く"
            className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            onClick={submitComment}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900"
          >
            投稿
          </button>
        </div>
      </div>
    </div>
  );
}
