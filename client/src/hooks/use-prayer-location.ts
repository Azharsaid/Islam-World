import { useEffect, useState } from "react";

export type PrayerLocation = {
  country: string;
  city: string;
};

const STORAGE_KEY = "prayer-location";

export function usePrayerLocation(defaultValue: PrayerLocation = { country: "Jordan", city: "Amman" }) {
  const [location, setLocation] = useState<PrayerLocation>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw) as PrayerLocation;
      if (parsed?.country && parsed?.city) return parsed;
      return defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {
      // ignore
    }
  }, [location]);

  return { location, setLocation };
}
