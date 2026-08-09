"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { APIProvider, InfoWindow, Map, Marker, useApiIsLoaded, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { CATEGORY_META, type Spot } from "@/lib/spots";
import { areaFromComponents } from "@/lib/googlePlaces";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function MarkerLayer({ spots, onMarkerClick }: { spots: Spot[]; onMarkerClick: (id: number) => void }) {
  const loaded = useApiIsLoaded();
  if (!loaded || typeof google === "undefined") return null;

  return (
    <>
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={{ lat: spot.lat, lng: spot.lng }}
          onClick={() => onMarkerClick(spot.id)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: CATEGORY_META[spot.category].markerColor,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
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

  return (
    <Map
      defaultCenter={{ lat: 36, lng: 137.5 }}
      defaultZoom={6}
      gestureHandling="greedy"
      style={{ width: "100%", height: "100%" }}
      onClick={async (e) => {
        const { latLng, placeId } = e.detail;
        if (!latLng) return;
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
      <MarkerLayer spots={spots} onMarkerClick={onMarkerClick} />
      {pendingLocation && (
        <InfoWindow position={pendingLocation} onCloseClick={onCancelAdd}>
          {addContent}
        </InfoWindow>
      )}
      {!pendingLocation && popupLocation && (
        <InfoWindow position={popupLocation} onCloseClick={onClosePopup} maxWidth={340}>
          {popupContent}
        </InfoWindow>
      )}
    </Map>
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
