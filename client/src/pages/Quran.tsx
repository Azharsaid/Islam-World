import { useChapters } from "@/hooks/use-quran";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { Search, BookOpen, CornerDownLeft } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type LastReadPosition = {
  chapterId: number;
  verseNumber: number;
  verseKey: string;
  updatedAt: string;
};

const LAST_READ_KEY = "lastReadPosition";

function safeReadLastPosition(): LastReadPosition | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (
      typeof obj?.chapterId !== "number" ||
      typeof obj?.verseNumber !== "number" ||
      typeof obj?.verseKey !== "string"
    ) {
      return null;
    }
    return obj as LastReadPosition;
  } catch {
    return null;
  }
}

export default function Quran() {
  const { data: chapters, isLoading } = useChapters();
  const [search, setSearch] = useState("");
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);

  useEffect(() => {
    setLastRead(safeReadLastPosition());
  }, []);

  const filteredChapters = useMemo(() => {
    return chapters?.filter(
      (c) =>
        c.name_arabic.includes(search) ||
        c.name_simple.toLowerCase().includes(search.toLowerCase())
    );
  }, [chapters, search]);

  const lastChapter = useMemo(() => {
    if (!chapters || !lastRead) return null;
    return chapters.find((c) => c.id === lastRead.chapterId) || null;
  }, [chapters, lastRead]);

  return (
    <PageTransition>
      <header className="mb-8 text-center space-y-4">
        <h1 className="text-4xl font-bold font-amiri text-primary">القرآن الكريم</h1>
        <p className="text-muted-foreground">اقرأ وتدبر في آيات الله</p>
      </header>

      {/* Continue reading */}
      {lastRead && lastChapter && (
        <div className="max-w-3xl mx-auto mb-8">
          <Link href={`/quran/${lastRead.chapterId}?v=${lastRead.verseNumber}`}>
            <div className="group cursor-pointer rounded-3xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-all p-5 md:p-6 flex items-center justify-between">
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">اكمل القراءة</p>
                <p className="text-xl font-bold font-amiri text-foreground group-hover:text-primary transition-colors">
                  سورة {lastChapter.name_arabic} — الآية {lastRead.verseNumber}
                </p>
                <p className="text-xs text-muted-foreground">{lastRead.verseKey}</p>
              </div>
              <Button
                variant="secondary"
                className="rounded-2xl gap-2 bg-white/70 hover:bg-white border border-accent/20"
              >
                <CornerDownLeft className="w-4 h-4" />
                متابعة
              </Button>
            </div>
          </Link>
        </div>
      )}

      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="بحث عن سورة..."
          className="pr-10 h-12 text-lg bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-card/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChapters?.map((chapter) => (
            <Link key={chapter.id} href={`/quran/${chapter.id}`}>
              <div className="group relative bg-card hover:bg-accent/5 border border-border/50 hover:border-accent/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold font-mono text-sm border border-primary/10 group-hover:scale-110 transition-transform">
                      {chapter.id}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-amiri group-hover:text-primary transition-colors">
                        سورة {chapter.name_arabic}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {chapter.translated_name.name} • {chapter.verses_count} آية
                      </p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-accent">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 left-0 w-8 h-8 opacity-10 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-primary">
                    <path d="M0 0 L100 0 L0 100 Z" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
