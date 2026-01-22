import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const [_, setLocation] = useLocation();

  // Redirect to Quran page by default
  useEffect(() => {
    setLocation("/quran");
  }, [setLocation]);

  return null;
}
