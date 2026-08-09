"use client";

import { useMemo, useState } from "react";
import GoogleMapView from "./GoogleMapView";
import SpotList from "./SpotList";
import SpotDetail from "./SpotDetail";
import ShareCard from "./ShareCard";
import QuickAddPanel, { type QuickAddState } from "./QuickAddPanel";
import { SEED_SPOTS, CATEGORY_META, type Category, type Spot } from "@/lib/spots";
import { loadUserSpots, addUserSpot, setMemo, loadLikedIds, saveLikedIds } from "@/lib/storage";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

const EMPTY_QUICK_ADD: QuickAddState = {
  name: "",
  area: "",
  category: "tourism",
  description: "",
  memo: "",
  sourceType: "none",
  sourceLabel: "",
};

function chipClass(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-medium ${
    active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-900"
  }`;
}

export default function MapView() {
  const [spots, setSpots] = useState<Spot[]>(() => [...SEED_SPOTS, ...loadUserSpots()]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [sortMode, setSortMode] = useState<"new" | "popular">("new");
  const [selectedId, setSelectedId] = useState(4);
  const [shareId, setShareId] = useState(4);
  const [likedIds, setLikedIds] = useState<Set<number>>(() => new Set(loadLikedIds()));
  const [likedOnly, setLikedOnly] = useState(false);
  const [mapPopupId, setMapPopupId] = useState<number | null>(null);

  const [focusToken, setFocusToken] = useState(0);
  const [mobilePane, setMobilePane] = useState<"map" | "list">("map");
  const [shareOpen, setShareOpen] = useState(false);

  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingLooking, setPendingLooking] = useState(false);
  const [quickAdd, setQuickAdd] = useState<QuickAddState>(EMPTY_QUICK_ADD);
  const [addError, setAddError] = useState<string | null>(null);

  const mapSpots = useMemo(() => {
    let result = activeCategory === "all" ? spots : spots.filter((s) => s.category === activeCategory);
    if (likedOnly) result = result.filter((s) => likedIds.has(s.id));
    return result;
  }, [spots, activeCategory, likedOnly, likedIds]);

  const listSpots = useMemo(
    () => [...mapSpots].sort((a, b) => (sortMode === "popular" ? b.likes - a.likes : b.recency - a.recency)),
    [mapSpots, sortMode],
  );

  const selectedSpot = spots.find((s) => s.id === selectedId) ?? spots[0];
  const shareSpot = spots.find((s) => s.id === shareId) ?? spots[0];
  const popupSpot = spots.find((s) => s.id === mapPopupId) ?? null;

  const selectSpot = (id: number, opts: { focus?: boolean; openPopup?: boolean } = {}) => {
    const { focus = false, openPopup = focus } = opts;
    setSelectedId(id);
    setShareId(id);
    setPendingLocation(null);
    setMapPopupId(openPopup ? id : null);
    if (focus) {
      setFocusToken((t) => t + 1);
      setMobilePane("map");
    }
  };

  const handleShare = (id: number) => {
    setShareId(id);
    setShareOpen(true);
  };

  const handleMarkerClick = (id: number) => {
    selectSpot(id, { openPopup: true });
  };

  const toggleLike = (id: number) => {
    const wasLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(id);
      else next.add(id);
      saveLikedIds(Array.from(next));
      return next;
    });
    setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, likes: s.likes + (wasLiked ? -1 : 1) } : s)));
  };

  const addComment = (id: number, text: string) => {
    setSpots((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, comments: [...s.comments, { id: crypto.randomUUID(), name: "あなた", time: "たった今", text }] }
          : s,
      ),
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPendingLocation({ lat, lng });
    setPendingLooking(true);
    setQuickAdd(EMPTY_QUICK_ADD);
    setAddError(null);
    setMapPopupId(null);
  };

  const handleSuggestion = (name: string, area: string) => {
    setPendingLooking(false);
    setQuickAdd((prev) => ({ ...prev, name: prev.name || name, area: prev.area || area }));
  };

  const cancelAdd = () => {
    setPendingLocation(null);
  };

  const submitQuickAdd = () => {
    if (!pendingLocation) return;
    if (!quickAdd.name.trim() || !quickAdd.area.trim()) {
      setAddError("場所の名前・エリアは必須です。");
      return;
    }
    if (!quickAdd.description.trim() && !quickAdd.memo.trim()) {
      setAddError("説明・口コミか、自分だけのメモのどちらかは入力してください。");
      return;
    }
    const newSpot: Spot = {
      id: Date.now(),
      name: quickAdd.name.trim(),
      area: quickAdd.area.trim(),
      lat: pendingLocation.lat,
      lng: pendingLocation.lng,
      category: quickAdd.category,
      description: quickAdd.description.trim(),
      dateLabel: "今日",
      recency: Date.now(),
      isNew: true,
      likes: 0,
      sourceType: quickAdd.sourceType === "none" ? undefined : quickAdd.sourceType,
      sourceLabel:
        quickAdd.sourceType === "none" ? undefined : quickAdd.sourceLabel.trim() || undefined,
      comments: [],
    };
    addUserSpot(newSpot);
    if (quickAdd.memo.trim()) {
      setMemo(newSpot.id, quickAdd.memo.trim());
    }
    setSpots((prev) => [...prev, newSpot]);
    setAddError(null);
    selectSpot(newSpot.id, { focus: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setActiveCategory("all")} className={chipClass(activeCategory === "all")}>
          すべて
        </button>
        {CATEGORIES.map((key) => (
          <button key={key} onClick={() => setActiveCategory(key)} className={chipClass(activeCategory === key)}>
            {CATEGORY_META[key].label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        <button
          onClick={() => setLikedOnly((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            likedOnly ? "border-red-700 bg-red-700 text-white" : "border-neutral-300 bg-white text-neutral-900"
          }`}
        >
          ♡ 行きたいだけ
        </button>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "new" | "popular")}
          className="ml-auto rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900"
        >
          <option value="new">新着順</option>
          <option value="popular">人気順</option>
        </select>
      </div>
      <p className="-mt-4 text-xs text-neutral-600">
        地図の空いている場所やお店のアイコンをクリックすると、その場で新しい行きたい場所を投稿できます。
      </p>

      <div className="grid grid-cols-2 gap-2 md:hidden" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "map"}
          onClick={() => setMobilePane("map")}
          className={`rounded-md border px-3 py-2 text-sm font-medium ${
            mobilePane === "map"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900"
          }`}
        >
          🗺️ 地図
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "list"}
          onClick={() => setMobilePane("list")}
          className={`rounded-md border px-3 py-2 text-sm font-medium ${
            mobilePane === "list"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900"
          }`}
        >
          📋 一覧（{listSpots.length}）
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_300px]">
        <div
          className={`h-[calc(100vh-220px)] min-h-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-white md:block md:h-[680px] ${
            mobilePane === "map" ? "block" : "hidden"
          }`}
        >
          <GoogleMapView
            spots={mapSpots}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleMapClick}
            onSuggestion={handleSuggestion}
            pendingLocation={pendingLocation}
            onCancelAdd={cancelAdd}
            focusLocation={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
            focusToken={focusToken}
            addContent={
              pendingLocation ? (
                <QuickAddPanel
                  position={pendingLocation}
                  looking={pendingLooking}
                  value={quickAdd}
                  onChange={setQuickAdd}
                  onCancel={cancelAdd}
                  onSubmit={submitQuickAdd}
                  error={addError}
                />
              ) : null
            }
            popupLocation={popupSpot ? { lat: popupSpot.lat, lng: popupSpot.lng } : null}
            onClosePopup={() => setMapPopupId(null)}
            popupContent={
              popupSpot ? (
                <div className="max-h-[65vh] w-[300px] overflow-y-auto pr-1 text-neutral-900">
                  <SpotDetail
                    spot={popupSpot}
                    allSpots={spots}
                    liked={likedIds.has(popupSpot.id)}
                    onToggleLike={toggleLike}
                    onAddComment={addComment}
                    onShare={handleShare}
                    onJumpTo={(id) => selectSpot(id, { focus: true })}
                  />
                </div>
              ) : null
            }
          />
        </div>
        <div
          className={`h-[calc(100vh-220px)] min-h-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-white md:block md:h-[680px] ${
            mobilePane === "list" ? "block" : "hidden"
          }`}
        >
          {listSpots.length > 0 ? (
            <SpotList
              spots={listSpots}
              selectedId={selectedId}
              likedIds={likedIds}
              onSelect={(id) => selectSpot(id, { focus: true })}
              onShare={handleShare}
              onToggleLike={toggleLike}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-xs text-neutral-500">
              {likedOnly
                ? "まだ「行きたい」を押した場所がありません。地図やリストで気になる場所の「行きたい」を押してみてください。"
                : "該当する場所がありません。"}
            </div>
          )}
        </div>
      </div>

      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-900">シェア画像を自動生成</h3>
              <button
                onClick={() => setShareOpen(false)}
                aria-label="閉じる"
                className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>
            <ShareCard spot={shareSpot} />
          </div>
        </div>
      )}
    </div>
  );
}
