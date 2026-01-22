import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/Sidebar";
import { Splash } from "@/components/Splash";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Quran from "@/pages/Quran";
import SurahReader from "@/pages/SurahReader";
import PrayerTimes from "@/pages/PrayerTimes";
import Athkar from "@/pages/Athkar";
import Qibla from "@/pages/Qibla";
import Dedication from "@/pages/Dedication";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quran" component={Quran} />
      <Route path="/quran/:id" component={SurahReader} />
      <Route path="/prayer-times" component={PrayerTimes} />
      <Route path="/athkar" component={Athkar} />
      <Route path="/qibla" component={Qibla} />
      <Route path="/dedication" component={Dedication} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Handle RTL direction
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  // GitHub Pages base path (e.g. /Islam-World/)
  const base =
    import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={base}>
        {showSplash ? (
        <Splash onComplete={() => setShowSplash(false)} />
      ) : (
        <div className="min-h-screen bg-background text-foreground font-amiri dir-rtl">
          <Sidebar />
          <main className="lg:mr-72 min-h-screen relative overflow-x-hidden bg-pattern">
             <div className="mt-16 lg:mt-0">
               <Router />
             </div>
          </main>
          <Toaster />
        </div>
      )}
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
