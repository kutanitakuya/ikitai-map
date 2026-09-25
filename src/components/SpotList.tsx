"use client";

import { CATEGORY_META, type Spot } from "@/lib/spots";

export default function SpotList({
  spots,
  selectedId,
  likedIds,
  onSelect,
  onToggleLike,
}: {
  spots: Spot[];
  selectedId: number;
  likedIds: Set<number>;
  onSelect: (id: number) => void;
  onToggleLike: (id: number) => void;
}) {
  return (
    <div className="flex h-full flex-col divide-y divide-neutral-100 overflow-y-auto bg-white">
      {spots.map((spot) => {
        const meta = CATEGORY_META[spot.category];
        const active = spot.id === selectedId;
        const liked = likedIds.has(spot.id);
        return (
          <button
            key={spot.id}
            onClick={() => onSelect(spot.id)}
            className={`flex gap-3 px-3 py-3 text-left hover:bg-neutral-100 ${active ? "bg-neutral-100" : "bg-white"}`}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-xs font-medium"
              style={{ backgroundColor: meta.markerColor + "1a", color: meta.markerColor }}
            >
              {meta.label.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-neutral-900">{spot.name}</span>
                {spot.isNew && <span className="flex-shrink-0 text-[10px] font-medium text-red-700">新着</span>}
              </div>
              <div className="truncate text-xs text-neutral-600">
                {spot.area} ・ {spot.dateLabel}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${meta.badgeClass}`}>{meta.label}</span>
                <span className="flex items-center gap-3">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(spot.id);
                    }}
                    className={`flex items-center gap-1 text-xs ${liked ? "font-medium text-red-700" : "text-neutral-600"}`}
                    title="行きたい"
                  >
                    {liked ? "♥" : "♡"} {spot.likes}
                  </span>
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
