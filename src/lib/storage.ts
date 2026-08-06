import type { Spot } from "./spots";

const STORAGE_KEY = "ikitai-map:user-spots";

export function loadUserSpots(): Spot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Spot[]) : [];
  } catch {
    return [];
  }
}

export function addUserSpot(spot: Spot) {
  const current = loadUserSpots();
  const next = [...current, spot];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

const MEMO_KEY = "ikitai-map:memos";

function loadMemos(): Record<number, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MEMO_KEY);
    return raw ? (JSON.parse(raw) as Record<number, string>) : {};
  } catch {
    return {};
  }
}

export function getMemo(spotId: number): string {
  return loadMemos()[spotId] ?? "";
}

export function setMemo(spotId: number, text: string) {
  const memos = loadMemos();
  if (text.trim()) {
    memos[spotId] = text;
  } else {
    delete memos[spotId];
  }
  window.localStorage.setItem(MEMO_KEY, JSON.stringify(memos));
}

const LIKED_KEY = "ikitai-map:liked";

export function loadLikedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIKED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function saveLikedIds(ids: number[]) {
  window.localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
}
