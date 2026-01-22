import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
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
        date: string;
        month: {
          en: string;
          ar: string;
        };
        year: string;
      };
      gregorian: {
        date: string;
        weekday: {
          en: string;
        };
      };
    };
  };
}

export function usePrayerTimes(latitude?: number, longitude?: number) {
  // Default to Makkah if no coordinates
  const lat = latitude ?? 21.3891;
  const lng = longitude ?? 39.8579;
  
  const dateStr = format(new Date(), "dd-MM-yyyy");

  return useQuery({
    queryKey: ["prayer-times", lat, lng, dateStr],
    queryFn: async () => {
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
      );
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const data = await res.json() as PrayerTimesResponse;
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
