"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  APIProvider,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  ControlPosition,
  InfoWindow,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { CATEGORY_META, type Spot } from "@/lib/spots";
import { areaFromComponents, distanceMeters } from "@/lib/googlePlaces";
import PlaceSearchBox from "./PlaceSearchBox";
import PlaceReviewCard from "./PlaceReviewCard";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
// Advanced Markers には Map ID が必須。未設定時は Google が用意する開発用の DEMO_MAP_ID を使う
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// 口コミカードを出す対象（お店・施設）。市区町村などのエリアは地図を動かすだけにする
const REVIEWABLE_TYPES = ["establishment", "point_of_interest"];
// 検索した場所から、この距離以内にあるアプリの投稿を「同じ場所」とみなす
const NEARBY_SPOT_METERS = 100;
// 地図上のポップアップの最大幅（中身は 400px + 余白）
const POPUP_MAX_WIDTH = 440;

function MarkerLayer({ spots, onMarkerClick }: { spots: Spot[]; onMarkerClick: (id: number) => void }) {
  return (
    <>
      {spots.map((spot) => (
        <AdvancedMarker
          key={spot.id}
          position={{ lat: spot.lat, lng: spot.lng }}
          onClick={() => onMarkerClick(spot.id)}
          anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          title={spot.name}
        >
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: CATEGORY_META[spot.category].markerColor }}
          />
        </AdvancedMarker>
      ))}
    </>
  );
}

function FocusHandler({
  focusLocation,
  focusToken,
}: {
  focusLocation: { lat: number; lng: number } | null;
  focusToken: number;
}) {
  const map = useMap();
  const lastToken = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !focusLocation || focusToken === lastToken.current) return;
    lastToken.current = focusToken;
    map.panTo(focusLocation);
    const currentZoom = map.getZoom() ?? 6;
    if (currentZoom < 13) {
      map.setZoom(15);
    }
  }, [map, focusLocation, focusToken]);

  return null;
}

function MapInner({
  spots,
  onMarkerClick,
  onMapClick,
  onSuggestion,
  pendingLocation,
  onCancelAdd,
  addContent,
  popupLocation,
  popupContent,
  onClosePopup,
  focusLocation,
  focusToken,
}: {
  spots: Spot[];
  onMarkerClick: (id: number) => void;
  onMapClick: (lat: number, lng: number) => void;
  onSuggestion: (name: string, area: string) => void;
  pendingLocation: { lat: number; lng: number } | null;
  onCancelAdd: () => void;
  addContent: ReactNode;
  popupLocation: { lat: number; lng: number } | null;
  popupContent: ReactNode;
  onClosePopup: () => void;
  focusLocation: { lat: number; lng: number } | null;
  focusToken: number;
}) {
  const placesLib = useMapsLibrary("places");
  const [searchedPlace, setSearchedPlace] = useState<google.maps.places.Place | null>(null);
  const searchRequestId = useRef(0);

  const handlePlaceSelected = async (place: google.maps.places.Place) => {
    const id = ++searchRequestId.current;
    setSearchedPlace(null);
    if (!placesLib || !place.types?.some((t) => REVIEWABLE_TYPES.includes(t))) return;

    onCancelAdd();
    onClosePopup();
    // 口コミ・評価は料金の高い SKU なので、お店・施設のときだけ別リクエストで取得する
    const detail = new placesLib.Place({ id: place.id, requestedLanguage: "ja" });
    try {
      await detail.fetchFields({
        fields: [
          "displayName",
          "formattedAddress",
          "addressComponents",
          "location",
          "rating",
          "userRatingCount",
          "reviews",
          "googleMapsURI",
        ],
      });
    } catch {
      return;
    }
    if (id === searchRequestId.current) setSearchedPlace(detail);
  };

  const closeSearchedPlace = () => {
    searchRequestId.current += 1;
    setSearchedPlace(null);
  };

  const searchedLocation = searchedPlace?.location?.toJSON() ?? null;
  const nearbySpot = searchedLocation
    ? (spots.find((s) => distanceMeters(s, searchedLocation) <= NEARBY_SPOT_METERS) ?? null)
    : null;

  const addSearchedPlace = () => {
    if (!searchedPlace || !searchedLocation) return;
    closeSearchedPlace();
    onMapClick(searchedLocation.lat, searchedLocation.lng);
    onSuggestion(searchedPlace.displayName ?? "", areaFromComponents(searchedPlace.addressComponents));
  };

  const handleMarkerClick = (id: number) => {
    closeSearchedPlace();
    onMarkerClick(id);
  };

  return (
    <div className="relative h-full w-full">
      <Map
        mapId={MAP_ID}
        defaultCenter={{ lat: 36, lng: 137.5 }}
        defaultZoom={6}
        gestureHandling="greedy"
        // 左上は検索バーを置くので、地図/航空写真の切り替えは左下へ移す
        mapTypeControlOptions={{ position: ControlPosition.LEFT_BOTTOM }}
        style={{ width: "100%", height: "100%" }}
        onClick={async (e) => {
          const { latLng, placeId } = e.detail;
          if (!latLng) return;
          closeSearchedPlace();
          onMapClick(latLng.lat, latLng.lng);
          if (placeId && placesLib) {
            const place = new placesLib.Place({ id: placeId });
            await place.fetchFields({ fields: ["displayName", "addressComponents"] });
            onSuggestion(place.displayName ?? "", areaFromComponents(place.addressComponents));
          } else {
            onSuggestion("", "");
          }
        }}
      >
        <FocusHandler focusLocation={focusLocation} focusToken={focusToken} />
        <MarkerLayer spots={spots} onMarkerClick={handleMarkerClick} />
        {pendingLocation && (
          <InfoWindow position={pendingLocation} onCloseClick={onCancelAdd} maxWidth={POPUP_MAX_WIDTH}>
            {addContent}
          </InfoWindow>
        )}
        {!pendingLocation && popupLocation && (
          <InfoWindow position={popupLocation} onCloseClick={onClosePopup} maxWidth={POPUP_MAX_WIDTH}>
            {popupContent}
          </InfoWindow>
        )}
        {!pendingLocation && !popupLocation && searchedPlace && searchedLocation && (
          <InfoWindow position={searchedLocation} onCloseClick={closeSearchedPlace} maxWidth={POPUP_MAX_WIDTH}>
            <div className="max-h-[65vh] w-[400px] max-w-full overflow-y-auto pr-1 text-neutral-900">
              <PlaceReviewCard
                place={searchedPlace}
                nearbySpot={nearbySpot}
                onAddSpot={addSearchedPlace}
                onOpenSpot={handleMarkerClick}
              />
            </div>
          </InfoWindow>
        )}
      </Map>
      <PlaceSearchBox onPlaceSelected={handlePlaceSelected} />
    </div>
  );
}

export default function GoogleMapView({
  spots,
  onMarkerClick,
  onMapClick,
  onSuggestion,
  pendingLocation,
  onCancelAdd,
  addContent,
  popupLocation,
  popupContent,
  onClosePopup,
  focusLocation,
  focusToken,
}: {
  spots: Spot[];
  onMarkerClick: (id: number) => void;
  onMapClick: (lat: number, lng: number) => void;
  onSuggestion: (name: string, area: string) => void;
  pendingLocation: { lat: number; lng: number } | null;
  onCancelAdd: () => void;
  addContent: ReactNode;
  popupLocation: { lat: number; lng: number } | null;
  popupContent: ReactNode;
  onClosePopup: () => void;
  focusLocation: { lat: number; lng: number } | null;
  focusToken: number;
}) {
  if (!API_KEY) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        Google Maps APIキーが未設定です。.env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください。
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <MapInner
        spots={spots}
        onMarkerClick={onMarkerClick}
        onMapClick={onMapClick}
        onSuggestion={onSuggestion}
        pendingLocation={pendingLocation}
        onCancelAdd={onCancelAdd}
        addContent={addContent}
        popupLocation={popupLocation}
        popupContent={popupContent}
        onClosePopup={onClosePopup}
        focusLocation={focusLocation}
        focusToken={focusToken}
      />
    </APIProvider>
  );
}
