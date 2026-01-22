import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sample data - in a real app this could be a large JSON file
const morningAthkar = [
  { id: 1, text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1 },
  { id: 2, text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ", count: 3 },
  { id: 3, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100 },
];

const eveningAthkar = [
  { id: 1, text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", count: 1 },
  { id: 2, text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3 },
];

function ThikerCard({ text, targetCount }: { text: string; targetCount: number }) {
  const [count, setCount] = useState(0);
  const isComplete = count >= targetCount;

  return (
    <div className={`
      relative p-6 rounded-2xl border transition-all duration-300
      ${isComplete ? 'bg-primary/5 border-primary/30' : 'bg-card border-border hover:border-accent/40'}
    `}>
      <div className="mb-6">
        <p className="text-2xl font-amiri leading-loose text-center text-foreground">
          {text}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground font-medium">
          التكرار: <span className="font-mono font-bold text-foreground">{targetCount}</span>
        </div>
        
        {isComplete ? (
          <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span>تم الإنتهاء</span>
          </div>
        ) : (
          <Button
            onClick={() => setCount(c => c + 1)}
            className="min-w-[100px] bg-accent hover:bg-accent/90 text-white font-bold text-lg h-12 rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-all"
          >
            {count} / {targetCount}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-b-2xl overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((count / targetCount) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function Athkar() {
  return (
    <PageTransition>
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-amiri text-primary">الأذكار اليومية</h1>
      </header>

      <Tabs defaultValue="morning" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl h-14">
          <TabsTrigger value="morning" className="text-lg font-amiri rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">أذكار الصباح</TabsTrigger>
          <TabsTrigger value="evening" className="text-lg font-amiri rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">أذكار المساء</TabsTrigger>
        </TabsList>
        
        <TabsContent value="morning" className="space-y-6">
          {morningAthkar.map((item) => (
            <ThikerCard key={item.id} text={item.text} targetCount={item.count} />
          ))}
        </TabsContent>
        
        <TabsContent value="evening" className="space-y-6">
          {eveningAthkar.map((item) => (
            <ThikerCard key={item.id} text={item.text} targetCount={item.count} />
          ))}
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
