import { PageTransition } from "@/components/PageTransition";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, Search, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eveningAthkar, morningAthkar, ThikrItem } from "@/data/athkar";

type CountMap = Record<string, number>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useAthkarProgress(storageKey: string, items: ThikrItem[]) {
  const targetMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) m[it.id] = it.count;
    return m;
  }, [items]);

  const [counts, setCounts] = useState<CountMap>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as CountMap;
      return parsed ?? {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(counts));
    } catch {
      // ignore
    }
  }, [counts, storageKey]);

  const totalTarget = useMemo(() => items.reduce((a, b) => a + b.count, 0), [items]);
  const totalDone = useMemo(
    () =>
      items.reduce((sum, it) => {
        const cur = counts[it.id] ?? 0;
        return sum + Math.min(cur, it.count);
      }, 0),
    [counts, items]
  );

  const percent = totalTarget ? Math.round((totalDone / totalTarget) * 100) : 0;

  const resetAll = () => setCounts({});

  const setFor = (id: string, value: number) =>
    setCounts((prev) => ({
      ...prev,
      [id]: clamp(value, 0, targetMap[id] ?? 0),
    }));

  const inc = (id: string) => setFor(id, (counts[id] ?? 0) + 1);
  const dec = (id: string) => setFor(id, (counts[id] ?? 0) - 1);

  return { counts, setFor, inc, dec, resetAll, totalTarget, totalDone, percent };
}

function ThikrCard({
  item,
  current,
  onInc,
  onDec,
  onReset,
}: {
  item: ThikrItem;
  current: number;
  onInc: () => void;
  onDec: () => void;
  onReset: () => void;
}) {
  const isComplete = current >= item.count;
  const localPercent = item.count ? Math.round((Math.min(current, item.count) / item.count) * 100) : 0;

  return (
    <motion.div
      layout
      className={[
        "relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden",
        isComplete
          ? "bg-primary/5 border-primary/30 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
          : "bg-card/70 backdrop-blur border-border/60 hover:border-accent/40",
      ].join(" ")}
    >
      {/* soft glow */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.7),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.7),transparent_55%)]" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {item.note && <Badge variant="secondary" className="w-fit text-xs">{item.note}</Badge>}
            <p className="text-2xl font-amiri leading-loose text-center text-foreground">
              {item.text}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {isComplete && <CheckCircle2 className="w-5 h-5 text-primary" />}
              <div className="text-sm text-muted-foreground">
                <span className="font-mono font-bold text-foreground">{current}</span>
                <span className="mx-1">/</span>
                <span className="font-mono">{item.count}</span>
              </div>
            </div>

            <Progress value={localPercent} className="h-2 w-28" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-border/60 hover:border-accent/40"
            title="إعادة ضبط هذا الذكر"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onDec}
              disabled={current <= 0}
              className="rounded-full border-border/60 hover:border-accent/40"
              title="إنقاص"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Button
              onClick={onInc}
              className="rounded-full px-5 shadow-lg shadow-primary/20"
              title="تسبيح / تكرار"
            >
              <Plus className="w-4 h-4 ml-2" />
              تكرار
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AthkarList({
  items,
  storageKey,
  title,
  subtitle,
}: {
  items: ThikrItem[];
  storageKey: string;
  title: string;
  subtitle: string;
}) {
  const { counts, inc, dec, resetAll, setFor, totalDone, totalTarget, percent } =
    useAthkarProgress(storageKey, items);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim();
    if (!query) return items;
    return items.filter((it) => it.text.includes(query) || (it.note?.includes(query) ?? false));
  }, [items, q]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/60 backdrop-blur p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-amiri text-primary">{title}</h2>
            <p className="text-sm text-muted-foreground font-amiri">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full lg:w-72 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث داخل الأذكار…"
                className="pr-9 bg-background/60"
              />
            </div>

            <Button variant="outline" onClick={resetAll} className="border-border/60 hover:border-accent/40">
              <RefreshCw className="w-4 h-4 ml-2" />
              تصفير الكل
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>الإنجاز</span>
            <span className="font-mono">{totalDone} / {totalTarget} • {percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {filtered.map((item) => {
            const current = counts[item.id] ?? 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ThikrCard
                  item={item}
                  current={current}
                  onInc={() => inc(item.id)}
                  onDec={() => dec(item.id)}
                  onReset={() => setFor(item.id, 0)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground p-10">
            لا يوجد نتائج لهذا البحث.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Athkar() {
  return (
    <PageTransition>
      <header className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center justify-center gap-3 px-5 py-2 rounded-full border bg-card/60 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground font-amiri">ذكرٌ يطمئن القلب</span>
          <span className="w-2 h-2 rounded-full bg-primary" />
        </div>

        <h1 className="text-4xl font-bold font-amiri text-primary">الأذكار</h1>
        <p className="text-muted-foreground font-amiri max-w-2xl mx-auto leading-relaxed">
          مجموعة الأذكار الأساسية المشهورة لصباحك ومساءك — مع عدّاد تكرار بسيط يساعدك على المتابعة.
        </p>
      </header>

      <Tabs defaultValue="morning" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/60 backdrop-blur border">
          <TabsTrigger value="morning" className="font-amiri text-lg">أذكار الصباح</TabsTrigger>
          <TabsTrigger value="evening" className="font-amiri text-lg">أذكار المساء</TabsTrigger>
        </TabsList>

        <TabsContent value="morning">
          <AthkarList
            items={morningAthkar}
            storageKey="athkar-progress-morning"
            title="أذكار الصباح"
            subtitle="ابدأ يومك بذكر الله — بترتيب مشهور وسهل."
          />
        </TabsContent>

        <TabsContent value="evening">
          <AthkarList
            items={eveningAthkar}
            storageKey="athkar-progress-evening"
            title="أذكار المساء"
            subtitle="اختم يومك بذكر الله — بهدوء وطمأنينة."
          />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
