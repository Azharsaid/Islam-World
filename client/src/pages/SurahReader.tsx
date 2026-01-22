import { useVerses, useChapters } from "@/hooks/use-quran";
import { PageTransition } from "@/components/PageTransition";
import { useParams, Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Share2, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type LastReadPosition = {
  chapterId: number;
  verseNumber: number; // verse number within surah
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

function saveLastPosition(pos: LastReadPosition) {
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(pos));
  // Keep the old key too (backward compatibility with earlier builds)
  localStorage.setItem("lastReadSurah", String(pos.chapterId));
}

export default function SurahReader() {
  const { id } = useParams();
  const chapterId = Number(id);

  const { data: verses, isLoading: isLoadingVerses } = useVerses(chapterId);
  const { data: chapters } = useChapters();
  const { toast } = useToast();

  const chapter = chapters?.find((c) => c.id === chapterId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [resumeVerse, setResumeVerse] = useState<number | null>(null);

  const queryVerse = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [chapterId]);

  // Determine resume point (saved progress)
  useEffect(() => {
    const saved = safeReadLastPosition();
    if (saved && saved.chapterId === chapterId) {
      setResumeVerse(saved.verseNumber);
    } else {
      setResumeVerse(null);
    }
  }, [chapterId]);

  const scrollToVerse = (verseNumber: number) => {
    const el = document.getElementById(`verse-${verseNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      toast({
        title: "تنبيه",
        description: "لم يتم العثور على الآية داخل الصفحة.",
        variant: "destructive",
      });
    }
  };

  // If opened with ?v= (from "اكمل القراءة"), auto-jump once after render
  useEffect(() => {
    if (!verses?.length || !queryVerse) return;
    const t = window.setTimeout(() => scrollToVerse(queryVerse), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, chapterId, queryVerse]);

  // Save reading progress while scrolling
  useEffect(() => {
    if (!verses?.length) return;

    const container = scrollRef.current;
    if (!container) return;

    let raf = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;

        // Pick the verse closest to the top (but not hidden under the sticky header)
        let bestEl: HTMLElement | null = null;
        let bestScore = Number.POSITIVE_INFINITY;

        for (const entry of visible) {
          const el = entry.target as HTMLElement;
          const top = Math.abs((entry.boundingClientRect?.top ?? 0) - 140);
          if (top < bestScore) {
            bestScore = top;
            bestEl = el;
          }
        }

        if (!bestEl) return;

        const verseNumber = Number(bestEl.dataset.verseNumber);
        const verseKey = String(bestEl.dataset.verseKey || "");

        if (!Number.isFinite(verseNumber) || verseNumber <= 0 || !verseKey) return;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const pos: LastReadPosition = {
            chapterId,
            verseNumber,
            verseKey,
            updatedAt: new Date().toISOString(),
          };
          saveLastPosition(pos);
          setResumeVerse(verseNumber);
        });
      },
      { threshold: 0.6, rootMargin: "-25% 0px -55% 0px" }
    );

    const els = Array.from(container.querySelectorAll<HTMLElement>("[data-verse-number]"));
    els.forEach((el) => observer.observe(el));

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [verses, chapterId]);

  const handleShare = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الآية للحافظة",
    });
  };

  if (isLoadingVerses || !chapter) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-48 mx-auto" />
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40 py-4 mb-6">
        <div className="flex items-center justify-between">
          <Link href="/quran">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary">
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold font-amiri text-primary">سورة {chapter.name_arabic}</h1>
            <p className="text-xs text-muted-foreground">
              {chapter.revelation_place === "makkah" ? "مكية" : "مدنية"} • {chapter.verses_count} آية
            </p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Resume button */}
      {resumeVerse && (
        <div className="mb-8 flex justify-center">
          <Button
            variant="secondary"
            className="rounded-2xl gap-2 bg-accent/10 hover:bg-accent/15 border border-accent/20"
            onClick={() => scrollToVerse(resumeVerse)}
          >
            <CornerDownLeft className="w-4 h-4" />
            اكمل القراءة من الآية {resumeVerse}
          </Button>
        </div>
      )}

      {/* Bismillah */}
      <div className="text-center mb-12 py-8 bg-accent/5 rounded-3xl border border-accent/10">
        <h2 className="text-3xl md:text-4xl font-amiri leading-loose text-foreground">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </h2>
      </div>

      {/* Verses */}
      <div className="space-y-8" ref={scrollRef}>
        {verses?.map((verse) => {
          const verseNumber = Number(verse.verse_key.split(":")[1]);
          const safeVerseNumber = Number.isFinite(verseNumber) ? verseNumber : verse.id;

          return (
            <div
              key={verse.verse_key}
              id={`verse-${safeVerseNumber}`}
              data-verse-number={safeVerseNumber}
              data-verse-key={verse.verse_key}
              className="relative group p-6 md:p-8 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-primary font-mono text-xs border border-primary/10">
                  {safeVerseNumber}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                  onClick={() => handleShare(verse.text_uthmani)}
                  aria-label="نسخ الآية"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-3xl md:text-4xl font-amiri leading-[2.5] text-right text-foreground">
                {verse.text_uthmani}
              </p>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between mt-12 pt-8 border-t border-border">
        {chapterId < 114 ? (
          <Link href={`/quran/${chapterId + 1}`}>
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
              السورة التالية
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {chapterId > 1 ? (
          <Link href={`/quran/${chapterId - 1}`}>
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
              <ChevronRight className="w-4 h-4" />
              السورة السابقة
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </PageTransition>
  );
}
