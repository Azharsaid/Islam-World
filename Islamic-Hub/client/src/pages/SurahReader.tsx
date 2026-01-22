import { useVerses, useChapters } from "@/hooks/use-quran";
import { PageTransition } from "@/components/PageTransition";
import { useParams, Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SurahReader() {
  const { id } = useParams();
  const chapterId = Number(id);
  const { data: verses, isLoading: isLoadingVerses } = useVerses(chapterId);
  const { data: chapters } = useChapters();
  const { toast } = useToast();
  
  const chapter = chapters?.find(c => c.id === chapterId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save progress
  useEffect(() => {
    if (chapterId) {
      localStorage.setItem("lastReadSurah", chapterId.toString());
    }
  }, [chapterId]);

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
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40 py-4 mb-8">
        <div className="flex items-center justify-between">
          <Link href="/quran">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary">
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold font-amiri text-primary">سورة {chapter.name_arabic}</h1>
            <p className="text-xs text-muted-foreground">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} • {chapter.verses_count} آية</p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Bismillah */}
      <div className="text-center mb-12 py-8 bg-accent/5 rounded-3xl border border-accent/10">
        <h2 className="text-3xl md:text-4xl font-amiri leading-loose text-foreground">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </h2>
      </div>

      {/* Verses */}
      <div className="space-y-8" ref={scrollRef}>
        {verses?.map((verse) => (
          <div 
            key={verse.id}
            id={`verse-${verse.id}`}
            className="relative group p-6 md:p-8 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-primary font-mono text-xs border border-primary/10">
                {verse.id}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                onClick={() => handleShare(verse.text_uthmani)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-3xl md:text-4xl font-amiri leading-[2.5] text-right text-foreground">
              {verse.text_uthmani}
            </p>
          </div>
        ))}
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
        ) : <div />}
        
        {chapterId > 1 ? (
          <Link href={`/quran/${chapterId - 1}`}>
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
              <ChevronRight className="w-4 h-4" />
              السورة السابقة
            </Button>
          </Link>
        ) : <div />}
      </div>
    </PageTransition>
  );
}
