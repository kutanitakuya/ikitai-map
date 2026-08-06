export function areaFromComponents(components: google.maps.places.AddressComponent[] | undefined): string {
  if (!components) return "";
  const pref = components.find((c) => c.types.includes("administrative_area_level_1"))?.longText ?? "";
  const city =
    components.find((c) => c.types.includes("locality"))?.longText ??
    components.find((c) => c.types.includes("sublocality_level_1"))?.longText ??
    "";
  return `${pref}${city}`;
}
