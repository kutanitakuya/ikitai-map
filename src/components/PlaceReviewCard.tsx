"use client";

import { useState } from "react";
import type { Spot } from "@/lib/spots";

const LONG_REVIEW_LENGTH = 100;

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-amber-500" aria-label={`5段階中${rating}`}>
      {"★".repeat(full)}
      <span className="text-neutral-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

function ReviewItem({ review }: { review: google.maps.places.Review }) {
  const [expanded, setExpanded] = useState(false);
  const author = review.authorAttribution;
  const text = review.text ?? "";
  const isLong = text.length > LONG_REVIEW_LENGTH;

  return (
    <li className="border-t border-neutral-100 py-2">
      <div className="flex items-center gap-2 text-xs">
        {author?.uri ? (
          <a href={author.uri} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
            {author.displayName}
          </a>
        ) : (
          <span className="font-medium">{author?.displayName ?? "匿名"}</span>
        )}
        <span className="text-neutral-500">{review.relativePublishTimeDescription}</span>
      </div>
      {review.rating != null && (
        <div className="text-xs">
          <Stars rating={review.rating} />
        </div>
      )}
      {text && (
        <p className={`mt-1 whitespace-pre-line text-xs leading-relaxed text-neutral-700 ${expanded ? "" : "line-clamp-4"}`}>
          {text}
        </p>
      )}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-neutral-500 hover:text-neutral-900"
        >
          {expanded ? "閉じる" : "もっと見る"}
        </button>
      )}
    </li>
  );
}

export default function PlaceReviewCard({
  place,
  nearbySpot,
  onAddSpot,
  onOpenSpot,
}: {
  place: google.maps.places.Place;
  nearbySpot: Spot | null;
  onAddSpot: () => void;
  onOpenSpot: (id: number) => void;
}) {
  const reviews = place.reviews ?? [];
  const address = place.formattedAddress?.replace(/^日本、/, "");

  return (
    <div>
      <h2 className="text-base font-medium text-neutral-900">{place.displayName}</h2>
      {address && <p className="mt-0.5 text-xs text-neutral-500">{address}</p>}
      {place.rating != null && (
        <div className="mt-1 flex items-center gap-1 text-sm">
          <span className="font-medium">{place.rating.toFixed(1)}</span>
          <Stars rating={place.rating} />
          {place.userRatingCount != null && (
            <span className="text-xs text-neutral-500">（{place.userRatingCount.toLocaleString()}件）</span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddSpot}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
        >
          ＋ 行きたい場所に追加
        </button>
        {nearbySpot && (
          <button
            type="button"
            onClick={() => onOpenSpot(nearbySpot.id)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-100"
          >
            このアプリの投稿を見る
          </button>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-xs font-medium text-neutral-900">Google の口コミ</h3>
        {reviews.length > 0 ? (
          <ul className="mt-1">
            {reviews.map((review, i) => (
              <ReviewItem key={`${review.authorAttribution?.displayName ?? ""}-${i}`} review={review} />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">口コミはまだありません。</p>
        )}
        {place.googleMapsURI && (
          <a
            href={place.googleMapsURI}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-blue-700 hover:underline"
          >
            Google マップですべての口コミを見る ↗
          </a>
        )}
      </div>
    </div>
  );
}
