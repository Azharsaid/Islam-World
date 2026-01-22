import { useQuery } from "@tanstack/react-query";

interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    language_name: string;
    name: string;
  };
}

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  text_imlaei_simple: string;
}

export function useChapters() {
  return useQuery({
    queryKey: ["quran-chapters"],
    queryFn: async () => {
      const res = await fetch("https://api.quran.com/api/v4/chapters");
      if (!res.ok) throw new Error("Failed to fetch chapters");
      const data = await res.json();
      return data.chapters as Chapter[];
    },
    staleTime: Infinity, // Quran chapters don't change
  });
}

export function useVerses(chapterId: number) {
  return useQuery({
    queryKey: ["quran-verses", chapterId],
    queryFn: async () => {
      const res = await fetch(
        `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`
      );
      if (!res.ok) throw new Error("Failed to fetch verses");
      const data = await res.json();
      return data.verses as Verse[];
    },
    staleTime: Infinity,
  });
}
