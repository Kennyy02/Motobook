import { useState } from "react";

export const formatAddress = (addr) => {
  const street = addr.road || addr.pedestrian || "";
  const barangay = addr.suburb || addr.village || addr.hamlet || "";
  const city = addr.city || addr.town || addr.municipality || "";
  const postal = addr.postcode || "";
  const province = addr.state || addr.region || "";

  let parts = [];
  if (street) parts.push(street);
  if (barangay) parts.push(barangay);
  if (city) parts.push(city);
  if (postal) parts.push(postal);
  if (province) parts.push(province);

  return parts.join(", ");
};

const proxy = "https://corsproxy.io/?";

export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    const res = await fetch(
      `${proxy}https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5&countrycodes=ph`
    );
    const results = await res.json();
    setSuggestions(results);
  };

  const resolveAddress = async (query) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=1&countrycodes=ph`
    );
    const results = await res.json();
    return results.length ? results[0] : null;
  };

  return { suggestions, fetchSuggestions, setSuggestions, resolveAddress };
}
