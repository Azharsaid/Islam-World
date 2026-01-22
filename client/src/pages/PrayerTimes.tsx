import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sunrise, Sun, Moon, Sunset, CloudMoon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const PrayerCard = ({ name, time, icon: Icon, isNext }: { name: string; time: string; icon: any; isNext?: boolean }) => (
  <div className={`
    relative overflow-hidden p-6 rounded-2xl border transition-all duration-300
    ${isNext 
      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105' 
      : 'bg-card text-foreground border-border/50 hover:border-primary/30'}
  `}>
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isNext ? 'bg-white/20' : 'bg-secondary'}`}>
          <Icon className={`w-6 h-6 ${isNext ? 'text-white' : 'text-primary'}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold font-amiri">{name}</h3>
          <p className={`text-sm ${isNext ? 'text-white/80' : 'text-muted-foreground'}`}>
            الصلاة القادمة
          </p>
        </div>
      </div>
      <div className="text-2xl font-bold font-mono tracking-wider">
        {time.replace(/\s\(.*\)/, '')}
      </div>
    </div>
    
    {/* Decorative Pattern Background for Active Card */}
    {isNext && (
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat" />
    )}
  </div>
);

export default function PrayerTimes() {
  const { data, isLoading } = usePrayerTimes();
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const timings = data?.timings;
  const hijri = data?.date.hijri;

  return (
    <PageTransition>
      <header className="text-center mb-10 space-y-2">
        <h1 className="text-3xl font-bold font-amiri text-primary">مواقيت الصلاة</h1>
        <p className="text-lg font-amiri text-muted-foreground">
          {hijri?.day} {hijri?.month.ar} {hijri?.year} هـ
        </p>
        <p className="text-sm text-muted-foreground font-mono">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: ar })}
        </p>
      </header>

      <div className="space-y-4 max-w-2xl mx-auto">
        {timings && (
          <>
            <PrayerCard name="الفجر" time={timings.Fajr} icon={CloudMoon} isNext={true} />
            <PrayerCard name="الشروق" time={timings.Sunrise} icon={Sunrise} />
            <PrayerCard name="الظهر" time={timings.Dhuhr} icon={Sun} />
            <PrayerCard name="العصر" time={timings.Asr} icon={Sun} />
            <PrayerCard name="المغرب" time={timings.Maghrib} icon={Sunset} />
            <PrayerCard name="العشاء" time={timings.Isha} icon={Moon} />
          </>
        )}
      </div>
    </PageTransition>
  );
}
