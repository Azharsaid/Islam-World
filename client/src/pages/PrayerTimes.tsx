import { useEffect, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Sun, Moon, Sunset, CloudMoon, MapPin, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useCountries } from "@/hooks/use-countries";
import { useCities } from "@/hooks/use-cities";
import { usePrayerLocation } from "@/hooks/use-prayer-location";
import { Combobox } from "@/components/Combobox";

const PrayerCard = ({
  name,
  time,
  icon: Icon,
  isNext,
}: {
  name: string;
  time: string;
  icon: any;
  isNext?: boolean;
}) => (
  <div
    className={[
      "relative overflow-hidden p-6 rounded-2xl border transition-all duration-300",
      isNext
        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.02]"
        : "bg-card/70 backdrop-blur text-foreground border-border/60 hover:border-accent/40",
    ].join(" ")}
  >
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-4">
        <div className={["p-3 rounded-full", isNext ? "bg-white/20" : "bg-secondary"].join(" ")}>
          <Icon className={["w-6 h-6", isNext ? "text-white" : "text-primary"].join(" ")} />
        </div>
        <div>
          <h3 className="text-xl font-bold font-amiri">{name}</h3>
          <p className={["text-sm", isNext ? "text-white/80" : "text-muted-foreground"].join(" ")}>
            {isNext ? "الصلاة القادمة" : "—"}
          </p>
        </div>
      </div>
      <div className="text-2xl font-bold font-mono tracking-wider">
        {time.replace(/\s\(.*\)/, "")}
      </div>
    </div>

    {isNext && (
      <div className="absolute inset-0 opacity-[0.10] pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,55,1),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.9),transparent_55%)]" />
    )}
  </div>
);

function parseTimingToDate(t: string) {
  const m = t.match(/(\d{1,2}):(\d{2})/);
  const d = new Date();
  if (!m) return d;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  d.setHours(hh, mm, 0, 0);
  return d;
}

export default function PrayerTimes() {
  const { location, setLocation } = usePrayerLocation({ country: "Jordan", city: "Amman" });

  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { data: cities, isLoading: citiesLoading } = useCities(location.country);

  // When country changes, ensure city is valid
  useEffect(() => {
    if (!cities || cities.length === 0) return;
    if (!location.city || !cities.includes(location.city)) {
      setLocation({ country: location.country, city: cities[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, location.country]);

  const { data, isLoading } = usePrayerTimes({
    country: location.country,
    city: location.city,
    method: 4,
  });

  const hijri = data?.date?.hijri;
  const timings = data?.timings;

  const countryItems = useMemo(() => {
    if (!countries) return [];
    return countries.map((c) => ({
      value: c.name,
      label: c.nameAr ? `${c.nameAr} — ${c.name}` : c.name,
    }));
  }, [countries]);

  const cityItems = useMemo(() => {
    if (!cities) return [];
    return cities.map((c) => ({ value: c, label: c }));
  }, [cities]);

  const prayers = useMemo(
    () => [
      { key: "Fajr", name: "الفجر", icon: CloudMoon },
      { key: "Sunrise", name: "الشروق", icon: Sunrise },
      { key: "Dhuhr", name: "الظهر", icon: Sun },
      { key: "Asr", name: "العصر", icon: Sun },
      { key: "Maghrib", name: "المغرب", icon: Sunset },
      { key: "Isha", name: "العشاء", icon: Moon },
    ],
    []
  );

  const nextKey = useMemo(() => {
    if (!timings) return "Fajr";
    const now = new Date();
    for (const p of prayers) {
      const dt = parseTimingToDate((timings as any)[p.key] as string);
      if (dt.getTime() > now.getTime()) return p.key;
    }
    return "Fajr"; // after Isha -> next day's Fajr
  }, [prayers, timings]);

  return (
    <PageTransition>
      <header className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center justify-center gap-3 px-5 py-2 rounded-full border bg-card/60 backdrop-blur">
          <Clock3 className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground font-amiri">مواقيت الصلاة حسب المدينة</span>
        </div>

        <h1 className="text-4xl font-bold font-amiri text-primary">مواقيت الصلاة</h1>

        <div className="flex items-center justify-center gap-2 text-muted-foreground font-amiri">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{location.city}</span>
          <span className="opacity-60">،</span>
          <span>{location.country}</span>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-amiri text-muted-foreground">
            {hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ` : ""}
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: ar })}
          </p>
        </div>
      </header>

      {/* Location Picker */}
      <Card className="max-w-2xl mx-auto p-5 rounded-2xl bg-card/60 backdrop-blur border-border/60 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-amiri">الدولة</span>
              {countriesLoading && <Badge variant="secondary">تحميل…</Badge>}
            </div>
            <Combobox
              items={countryItems}
              value={location.country}
              onChange={(val) => setLocation({ country: val, city: "" })}
              placeholder="اختر الدولة"
              searchPlaceholder="ابحث عن دولة…"
              disabled={countriesLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-amiri">المدينة</span>
              {citiesLoading && <Badge variant="secondary">تحميل…</Badge>}
            </div>
            <Combobox
              items={cityItems}
              value={location.city}
              onChange={(val) => setLocation({ country: location.country, city: val })}
              placeholder={location.country ? "اختر المدينة" : "اختر الدولة أولاً"}
              searchPlaceholder="ابحث عن مدينة…"
              disabled={!location.country || citiesLoading || cityItems.length === 0}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="p-2 space-y-4 max-w-2xl mx-auto">
          <Skeleton className="h-24 w-full rounded-2xl" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {timings &&
            prayers.map((p) => (
              <PrayerCard
                key={p.key}
                name={p.name}
                time={(timings as any)[p.key]}
                icon={p.icon}
                isNext={nextKey === p.key}
              />
            ))}
        </div>
      )}
    </PageTransition>
  );
}
