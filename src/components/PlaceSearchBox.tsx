"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

type Prediction = google.maps.places.PlacePrediction;

const SEARCH_ZOOM = 16;

export default function PlaceSearchBox() {
  const map = useMap();
  const placesLib = useMapsLibrary("places");

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);

  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    requestId.current += 1;
  };

  const fetchPredictions = async (input: string): Promise<Prediction[]> => {
    if (!placesLib) return [];
    const id = ++requestId.current;
    sessionToken.current ??= new placesLib.AutocompleteSessionToken();
    try {
      const { suggestions } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: sessionToken.current,
        includedRegionCodes: ["jp"],
        language: "ja",
        region: "jp",
      });
      const result = suggestions.flatMap((s) => (s.placePrediction ? [s.placePrediction] : []));
      if (id === requestId.current) setPredictions(result);
      return result;
    } catch {
      if (id === requestId.current) setPredictions([]);
      return [];
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setOpen(true);
    cancelPending();
    const input = value.trim();
    if (!input) {
      setPredictions([]);
      return;
    }
    debounceTimer.current = setTimeout(() => fetchPredictions(input), 200);
  };

  const selectPrediction = async (prediction: Prediction) => {
    cancelPending();
    setQuery(prediction.mainText?.text ?? prediction.text.text);
    setPredictions([]);
    setOpen(false);
    // fetchFields で自動補完セッションが終わるので、次の検索では新しいトークンを使う
    sessionToken.current = null;

    const place = prediction.toPlace();
    await place.fetchFields({ fields: ["viewport", "location"] });
    if (!map) return;
    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else if (place.location) {
      map.panTo(place.location);
      map.setZoom(SEARCH_ZOOM);
    }
  };

  const clear = () => {
    cancelPending();
    setQuery("");
    setPredictions([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    // 日本語入力の変換確定の Enter では検索しない
    if (e.nativeEvent.isComposing) return;

    if (e.key === "ArrowDown" && predictions.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % predictions.length);
    } else if (e.key === "ArrowUp" && predictions.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? predictions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const input = query.trim();
      if (!input) return;
      let list = predictions;
      if (list.length === 0) {
        cancelPending();
        list = await fetchPredictions(input);
      }
      const target = list[activeIndex] ?? list[0];
      if (target) selectPrediction(target);
    }
  };

  const showList = open && predictions.length > 0;

  return (
    <div className="absolute left-3 top-3 z-10 w-[calc(100%-4.5rem)] max-w-sm">
      <div className="flex items-center rounded-md border border-neutral-300 bg-white shadow-sm focus-within:border-neutral-900">
        <span aria-hidden className="pl-3 text-sm text-neutral-400">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="住所・地名で検索"
          aria-label="住所・地名で検索"
          role="combobox"
          aria-expanded={showList}
          aria-controls="place-search-list"
          aria-autocomplete="list"
          className="w-full bg-transparent px-2 py-2 text-base text-neutral-900 md:text-sm outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="検索をクリア"
            className="mr-1 rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            ✕
          </button>
        )}
      </div>
      {showList && (
        <ul
          id="place-search-list"
          role="listbox"
          className="mt-1 max-h-72 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {predictions.map((p, i) => (
            <li
              key={p.placeId}
              role="option"
              aria-selected={i === activeIndex}
              // blur より先に選択させるため mousedown で処理する
              onMouseDown={(e) => {
                e.preventDefault();
                selectPrediction(p);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer px-3 py-2 ${i === activeIndex ? "bg-neutral-100" : ""}`}
            >
              <div className="text-sm text-neutral-900">{p.mainText?.text ?? p.text.text}</div>
              {p.secondaryText && <div className="text-xs text-neutral-500">{p.secondaryText.text}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
