import { PageTransition } from "@/components/PageTransition";
import { useEffect, useState } from "react";
import { Compass, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Qibla() {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (KAABA_COORDS.lat * Math.PI) / 180.0;
    const lambdaK = (KAABA_COORDS.lng * Math.PI) / 180.0;
    const phi = (lat * Math.PI) / 180.0;
    const lambda = (lng * Math.PI) / 180.0;
    
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
      );
      
    return Math.round(psi < 0 ? psi + 360 : psi);
  };

  const startCompass = () => {
    if (!navigator.geolocation) {
      setError("الموقع الجغرافي غير مدعوم في هذا المتصفح");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const bearing = calculateQibla(latitude, longitude);
        setQiblaBearing(bearing);
        
        // Handle device orientation
        if (window.DeviceOrientationEvent) {
          window.addEventListener("deviceorientationabsolute", (event: any) => {
            const heading = event.alpha ? 360 - event.alpha : 0;
            setHeading(heading);
          }, true);
        } else {
          toast({
             title: "تنبيه",
             description: "جهازك لا يدعم البوصلة الرقمية",
             variant: "destructive"
          });
        }
      },
      (err) => {
        setError("تعذر الحصول على الموقع. الرجاء تفعيل خدمات الموقع.");
      }
    );
  };

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold font-amiri text-primary">اتجاه القبلة</h1>
          <p className="text-muted-foreground">وجه هاتفك نحو الكعبة المشرفة</p>
        </header>

        {!qiblaBearing ? (
          <Button 
            size="lg" 
            onClick={startCompass}
            className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6 rounded-2xl shadow-lg shadow-primary/25"
          >
            <Navigation className="mr-2 h-6 w-6" />
            تحديد اتجاه القبلة
          </Button>
        ) : (
          <div className="relative w-72 h-72">
            {/* Compass Rose */}
            <div className="absolute inset-0 border-4 border-border rounded-full bg-white shadow-xl flex items-center justify-center">
               <span className="absolute top-4 text-xs font-bold text-muted-foreground">N</span>
               <span className="absolute bottom-4 text-xs font-bold text-muted-foreground">S</span>
               <span className="absolute left-4 text-xs font-bold text-muted-foreground">W</span>
               <span className="absolute right-4 text-xs font-bold text-muted-foreground">E</span>
            </div>

            {/* Rotating Arrow Container - Rotates based on Device Heading */}
            <motion.div 
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              animate={{ rotate: heading ? -heading : 0 }}
              transition={{ type: "spring", stiffness: 50 }}
            >
               {/* Qibla Indicator - Fixed offset based on location */}
               <div 
                 className="absolute w-1 h-32 bg-transparent origin-bottom bottom-1/2"
                 style={{ transform: `rotate(${qiblaBearing}deg)` }}
               >
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/3214/3214699.png" 
                      alt="Kaaba" 
                      className="w-8 h-8 mb-1 drop-shadow-md"
                    />
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-primary" />
                 </div>
               </div>
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-foreground w-2 h-2 rounded-full" />
            </div>
          </div>
        )}

        {qiblaBearing && (
          <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
             <p className="text-lg font-amiri">
               زاوية القبلة: <span className="font-bold text-primary">{qiblaBearing}°</span>
             </p>
          </div>
        )}

        {error && (
          <p className="text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
      </div>
    </PageTransition>
  );
}
