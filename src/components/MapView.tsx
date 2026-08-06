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

  const selectSpot = (id: number) => {
    setSelectedId(id);
    setShareId(id);
    setPendingLocation(null);
    setMapPopupId(null);
  };

  const handleMarkerClick = (id: number) => {
    selectSpot(id);
    setMapPopupId(id);
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
    selectSpot(newSpot.id);
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_300px]">
        <div className="h-[460px] overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <GoogleMapView
            spots={mapSpots}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleMapClick}
            onSuggestion={handleSuggestion}
            pendingLocation={pendingLocation}
            onCancelAdd={cancelAdd}
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
                <div className="w-[200px] text-neutral-900">
                  <p className="text-sm font-medium">{popupSpot.name}</p>
                  <p className="text-xs text-neutral-600">{popupSpot.area}</p>
                  <button
                    onClick={() => toggleLike(popupSpot.id)}
                    className={`mt-2 w-full rounded-md border px-3 py-1.5 text-xs font-medium ${
                      likedIds.has(popupSpot.id)
                        ? "border-red-200 bg-red-50 text-red-800"
                        : "border-neutral-300 bg-white text-neutral-900"
                    }`}
                  >
                    {likedIds.has(popupSpot.id) ? "♥" : "♡"} 行きたい（{popupSpot.likes}）
                  </button>
                </div>
              ) : null
            }
          />
        </div>
        <div className="h-[460px] overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {listSpots.length > 0 ? (
            <SpotList
              spots={listSpots}
              selectedId={selectedId}
              likedIds={likedIds}
              onSelect={selectSpot}
              onShare={setShareId}
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

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-neutral-900">場所の詳細</h3>
        <SpotDetail
          spot={selectedSpot}
          allSpots={spots}
          liked={likedIds.has(selectedSpot.id)}
          onToggleLike={toggleLike}
          onAddComment={addComment}
          onShare={setShareId}
          onJumpTo={selectSpot}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-neutral-900">シェア画像を自動生成</h3>
        <ShareCard spot={shareSpot} />
      </div>
    </div>
  );
}
