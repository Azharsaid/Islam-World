import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export interface PrayerTimesData {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    readable: string;
    hijri: {
      day: string;
      year: string;
      month: {
        en: string;
        ar: string;
      };
    };
    gregorian: {
      date: string;
      weekday: {
        en: string;
      };
    };
  };
  meta?: {
    timezone?: string;
  };
}

interface PrayerTimesResponse {
  code: number;
  status: string;
  data: PrayerTimesData;
}

export type PrayerTimesParams = {
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  method?: number;
};

/**
 * Fetch prayer times using AlAdhan API.
 * - If city + country are provided => timingsByCity
 * - Else falls back to latitude/longitude
 */
export function usePrayerTimes(params: PrayerTimesParams = {}) {
  const {
    country = "Jordan",
    city = "Amman",
    latitude,
    longitude,
    method = 4,
  } = params;

  const dateStr = format(new Date(), "dd-MM-yyyy");

  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const mode = hasCoords ? "coords" : "city";

  return useQuery({
    queryKey: ["prayer-times", mode, country, city, latitude, longitude, method, dateStr],
    queryFn: async () => {
      const url = hasCoords
        ? `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`
        : `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const json = (await res.json()) as PrayerTimesResponse;
      return json.data;
    },
    staleTime: 1000 * 60 * 60, // Cache 1h
  });
}
