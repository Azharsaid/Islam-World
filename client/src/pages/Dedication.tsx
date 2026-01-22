import { PageTransition } from "@/components/PageTransition";
import { HeartHandshake } from "lucide-react";

export default function Dedication() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-2xl mx-auto">
        <div className="p-6 bg-primary/5 rounded-full mb-4">
          <HeartHandshake className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-4xl font-bold font-amiri text-primary leading-tight">
          صدقة جارية
        </h1>

        <div className="space-y-6 text-xl leading-relaxed text-foreground/80 font-amiri">
          <p>
            اللهم اجعل هذا العمل خالصاً لوجهك الكريم، وتقبله صدقة جارية عن أرواح:
          </p>
          
          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <p className="text-2xl font-bold text-accent">
              أبو نشأت وأم نشأت
            </p>
            <div className="w-16 h-px bg-border mx-auto" />
            <p className="text-2xl font-bold text-accent">
              أبو سليم وأم سليم
            </p>
          </div>

          <p>
            اللهم اغفر لهم وارحمهم، وعافهم واعف عنهم، وأكرم نزلهم، ووسع مدخلهم، واغسلهم بالماء والثلج والبرد.
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            نسألكم الدعاء لهم بالرحمة والمغفرة
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
