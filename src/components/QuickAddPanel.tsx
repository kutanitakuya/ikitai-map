"use client";

import { CATEGORY_META, SOURCE_LABELS, type Category, type SourceType } from "@/lib/spots";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];
const OPTIONAL_SOURCES: SourceType[] = ["drama", "anime", "celebrity", "review"];

export interface QuickAddState {
  name: string;
  area: string;
  category: Category;
  description: string;
  memo: string;
  sourceType: SourceType | "none";
  sourceLabel: string;
}

export default function QuickAddPanel({
  position,
  looking,
  value,
  onChange,
  onCancel,
  onSubmit,
  error,
}: {
  position: { lat: number; lng: number };
  looking: boolean;
  value: QuickAddState;
  onChange: (next: QuickAddState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string | null;
}) {
  const set = <K extends keyof QuickAddState>(key: K, v: QuickAddState[K]) => onChange({ ...value, [key]: v });

  return (
    <div className="w-[280px] py-1 text-neutral-900">
      <p className="mb-1 text-sm font-medium text-neutral-900">新しい行きたい場所</p>
      <p className="text-xs text-neutral-600">
        選択した位置: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        {looking && "（付近の場所情報を確認中…）"}
      </p>

      <div className="mt-3">
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
        <label className="mb-1 block text-sm font-medium text-neutral-900">説明・口コミ（公開・任意）</label>
        <textarea
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="どんな場所か、なぜ行きたいのかを書いてください"
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-medium text-amber-900">自分だけのメモ</span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">非公開</span>
        </div>
        <textarea
          value={value.memo}
          onChange={(e) => set("memo", e.target.value)}
          rows={2}
          placeholder="例: 〇〇さんに勧められた。次の連休に行く。"
          className="w-full rounded-md border border-amber-200 bg-white px-2 py-1.5 text-xs text-neutral-900 placeholder:text-amber-700/50"
        />
        <p className="mt-1.5 text-[11px] text-amber-800">このメモはあなたのブラウザにだけ保存され、他の人には表示されません。</p>
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
