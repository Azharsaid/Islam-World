import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen, Moon, Clock, Compass, HeartHandshake } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const menuItems = [
  { href: "/quran", label: "القرآن الكريم", icon: BookOpen },
  { href: "/prayer-times", label: "مواقيت الصلاة", icon: Clock },
  { href: "/athkar", label: "الأذكار", icon: Moon },
  { href: "/qibla", label: "القبلة", icon: Compass },
  { href: "/dedication", label: "الإهداء", icon: HeartHandshake },
];

export function Sidebar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-pattern">
      <div className="p-6 border-b border-border/40">
        <h1 className="text-3xl font-bold text-primary font-amiri text-center">نور الهدى</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-foreground hover:bg-secondary hover:text-primary"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-primary")} />
                <span className="text-lg font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="mr-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border/40 bg-accent/5">
        <p className="text-xs text-center text-muted-foreground font-amiri leading-relaxed">
          صدقة جارية عن روح أبو نشأت، أم نشأت<br/>أبو سليم وأم سليم
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen flex-col border-l border-border bg-card fixed right-0 top-0 z-30 shadow-xl">
        <NavContent />
      </aside>

      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card/80 backdrop-blur border-primary/20 hover:bg-primary/10 text-primary">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-80 border-l border-border bg-card">
             <SheetHeader className="sr-only">
               <SheetTitle>القائمة الرئيسية</SheetTitle>
             </SheetHeader>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
