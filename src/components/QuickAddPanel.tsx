"use client";

import { useState } from "react";
import { CATEGORY_META, SOURCE_LABELS, type Category, type SourceType } from "@/lib/spots";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];
const OPTIONAL_SOURCES: SourceType[] = ["drama", "anime", "celebrity", "review"];

export interface QuickAddState {
  name: string;
  area: string;
  category: Category;
  note: string;
  visibility: "public" | "private";
  sourceType: SourceType | "none";
  sourceLabel: string;
}

function visibilityClass(active: boolean) {
  return `flex-1 rounded-md border px-3 py-1.5 text-sm font-medium ${
    active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-900"
  }`;
}

export default function QuickAddPanel({
  looking,
  value,
  onChange,
  onCancel,
  onSubmit,
  error,
}: {
  looking: boolean;
  value: QuickAddState;
  onChange: (next: QuickAddState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string | null;
}) {
  const set = <K extends keyof QuickAddState>(key: K, v: QuickAddState[K]) => onChange({ ...value, [key]: v });

  // Google から名前・エリアが取れたときは確認表示だけにし、「編集」を押したときだけ入力欄にする
  const [editingPlace, setEditingPlace] = useState(false);
  const showPlaceInputs = editingPlace || (!looking && (!value.name || !value.area));

  return (
    <div className="w-[400px] max-w-full py-1 text-neutral-900">
      <p className="mb-2 text-base font-medium text-neutral-900">新しい行きたい場所</p>

      {looking ? (
        <p className="text-sm text-neutral-600">付近の場所情報を確認中…</p>
      ) : showPlaceInputs ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">場所の名前</label>
            <input
              type="text"
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="例: 三代目綿飴店"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-neutral-900">エリア</label>
            <input
              type="text"
              value={value.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="例: 東京都台東区"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        </>
      ) : (
        <div className="flex items-start justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2">
          <div className="min-w-0">
            <div className="text-base font-medium text-neutral-900">{value.name}</div>
            <div className="text-sm text-neutral-600">{value.area}</div>
          </div>
          <button
            type="button"
            onClick={() => setEditingPlace(true)}
            className="flex-shrink-0 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
          >
            編集
          </button>
        </div>
      )}

      <div className="mt-3">
        <label className="mb-1 block text-sm font-medium text-neutral-900">カテゴリ</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => set("category", key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                value.category === key
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-900"
              }`}
            >
              {CATEGORY_META[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-sm font-medium text-neutral-900">口コミ・メモ</label>
        <textarea
          value={value.note}
          onChange={(e) => set("note", e.target.value)}
          rows={4}
          placeholder={
            value.visibility === "public"
              ? "どんな場所か、なぜ行きたいのかを書いてください"
              : "例: 〇〇さんに勧められた。次の連休に行く。"
          }
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => set("visibility", "public")}
            className={visibilityClass(value.visibility === "public")}
          >
            公開
          </button>
          <button
            type="button"
            onClick={() => set("visibility", "private")}
            className={visibilityClass(value.visibility === "private")}
          >
            非公開（自分だけ）
          </button>
        </div>
        <p className="mt-1.5 text-xs text-neutral-600">
          {value.visibility === "public"
            ? "口コミとして、ほかの人にも表示されます。"
            : "自分だけのメモとして、このブラウザにだけ保存されます。ほかの人には表示されません。"}
        </p>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-sm font-medium text-neutral-900">話題の元ネタ（任意）</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set("sourceType", "none")}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              value.sourceType === "none"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-900"
            }`}
          >
            特になし
          </button>
          {OPTIONAL_SOURCES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => set("sourceType", key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                value.sourceType === key
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-900"
              }`}
            >
              {SOURCE_LABELS[key]}
            </button>
          ))}
        </div>
        {value.sourceType !== "none" && (
          <input
            type="text"
            value={value.sourceLabel}
            onChange={(e) => set("sourceLabel", e.target.value)}
            placeholder="例: ドラマ『◯◯』第3話 ロケ地"
            className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
        )}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          投稿する
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
