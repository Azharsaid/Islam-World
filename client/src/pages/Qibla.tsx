import { PageTransition } from "@/components/PageTransition";
import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Qibla() {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const orientationHandlerRef = useRef<(e: any) => void>();
  const startedRef = useRef(false);

  const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

  const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;

  const calculateQibla = (lat: number, lng: number) => {
    // Initial bearing from (lat,lng) to Kaaba (degrees from true North)
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

  const getHeadingFromEvent = (event: any): number | null => {
    // iOS Safari
    if (typeof event?.webkitCompassHeading === "number") {
      return normalizeDeg(event.webkitCompassHeading);
    }

    // Most browsers expose alpha (0..360). Convert to compass-like heading.
    if (typeof event?.alpha === "number") {
      return normalizeDeg(360 - event.alpha);
    }

    return null;
  };

  const removeOrientationListener = () => {
    if (orientationHandlerRef.current) {
      window.removeEventListener("deviceorientationabsolute", orientationHandlerRef.current as any, true);
      window.removeEventListener("deviceorientation", orientationHandlerRef.current as any, true);
      orientationHandlerRef.current = undefined;
    }
  };

  useEffect(() => {
    return () => {
      removeOrientationListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestOrientationPermissionIfNeeded = async () => {
    // iOS 13+ requires a permission prompt for motion/orientation sensors
    const anyDeviceOrientationEvent = window.DeviceOrientationEvent as any;
    if (anyDeviceOrientationEvent && typeof anyDeviceOrientationEvent.requestPermission === "function") {
      const res = await anyDeviceOrientationEvent.requestPermission();
      if (res !== "granted") {
        throw new Error("PERMISSION_DENIED");
      }
    }
  };

  const getGeolocation = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

  const startCompass = async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    setError(null);
    setIsLoading(true);

    try {
      if (!window.isSecureContext) {
        setError("ميزة القبلة تحتاج فتح الموقع عبر HTTPS (اتصال آمن).");
        return;
      }

      if (!navigator.geolocation) {
        setError("الموقع الجغرافي غير مدعوم في هذا المتصفح");
        return;
      }

      const position = await getGeolocation();
      const { latitude, longitude } = position.coords;
      const bearing = calculateQibla(latitude, longitude);
      setQiblaBearing(bearing);

      // Request permission (iOS) then listen to device orientation
      await requestOrientationPermissionIfNeeded();

      const handler = (event: any) => {
        const h = getHeadingFromEvent(event);
        if (h === null) return;
        setHeading(h);
      };

      orientationHandlerRef.current = handler;
      // Use both events for best coverage across browsers
      window.addEventListener("deviceorientationabsolute", handler as any, true);
      window.addEventListener("deviceorientation", handler as any, true);

      toast({
        title: "تم التفعيل",
        description: "حرّك الهاتف ببطء للحصول على اتجاه أدق.",
      });
    } catch (e: any) {
      if (e?.message === "PERMISSION_DENIED") {
        setError("الرجاء السماح بالوصول للحركة/البوصلة من إعدادات المتصفح ثم أعد المحاولة.");
      } else {
        setError("تعذر الحصول على الموقع أو البوصلة. تأكد من تفعيل خدمات الموقع والسماح بالأذونات.");
      }
      startedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const canShowCompass = qiblaBearing !== null;

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold font-amiri text-primary">اتجاه القبلة</h1>
          <p className="text-muted-foreground">اختر “تحديد اتجاه القبلة” ثم وجّه هاتفك نحو الكعبة المشرفة</p>
        </header>

        {!canShowCompass ? (
          <Button
            size="lg"
            onClick={startCompass}
            disabled={isLoading}
            className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6 rounded-2xl shadow-lg shadow-primary/25"
          >
            <Navigation className="mr-2 h-6 w-6" />
            {isLoading ? "جارٍ التحديد..." : "تحديد اتجاه القبلة"}
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

            {/* Rotating container based on device heading */}
            <motion.div
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              animate={{ rotate: heading !== null ? -heading : 0 }}
              transition={{ type: "spring", stiffness: 50 }}
            >
              {/* Qibla Indicator - offset based on location */}
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

        {qiblaBearing !== null && (
          <div className="p-4 bg-accent/10 rounded-xl border border-accent/20 space-y-1">
            <p className="text-lg font-amiri">
              زاوية القبلة: <span className="font-bold text-primary">{qiblaBearing}°</span>
            </p>
            {heading === null && (
              <p className="text-xs text-muted-foreground">
                ملاحظة: إذا كانت البوصلة غير مدعومة على جهازك، ستظهر الزاوية فقط بدون اتجاه ديناميكي.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-lg max-w-md">
            {error}
          </p>
        )}
      </div>
    </PageTransition>
  );
}
