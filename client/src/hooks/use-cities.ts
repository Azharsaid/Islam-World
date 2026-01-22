import { useQuery } from "@tanstack/react-query";

type CitiesResponse = {
  error: boolean;
  msg?: string;
  data?: string[];
};

export function useCities(country?: string) {
  return useQuery({
    queryKey: ["cities", country],
    enabled: !!country,
    queryFn: async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      if (!res.ok) throw new Error("Failed to fetch cities");
      const json = (await res.json()) as CitiesResponse;
      if (json.error) throw new Error(json.msg || "Failed to fetch cities");
      const cities = (json.data || []).slice().sort((a, b) => a.localeCompare(b, "ar"));
      return cities;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}
