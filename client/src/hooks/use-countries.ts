import { useQuery } from "@tanstack/react-query";

export type CountryOption = {
  name: string;      // English/common name
  nameAr?: string;   // Arabic name when available
};

type RestCountriesItem = {
  name?: { common?: string };
  translations?: { ara?: { common?: string } };
};

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetch("https://restcountries.com/v3.1/all?fields=name,translations");
      if (!res.ok) throw new Error("Failed to fetch countries");
      const data = (await res.json()) as RestCountriesItem[];
      const mapped: CountryOption[] = (data || [])
        .map((c) => ({
          name: c?.name?.common ?? "",
          nameAr: c?.translations?.ara?.common,
        }))
        .filter((c) => c.name)
        .sort((a, b) => (a.nameAr || a.name).localeCompare(b.nameAr || b.name, "ar"));
      return mapped;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}
