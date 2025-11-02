"use client";

import { useState } from "react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import AICenter from "@/components/ai-center";
import OpenEcosystem from "@/components/open-ecosystem";
import Footer from "@/components/footer";
import AuthModal from "@/components/auth-modal";

import WebGLBackground from "@/components/webgl-background";

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
  <main className="min-h-screen bg-background relative overflow-x-hidden" style={{ background: "#0a0a1a" }}>
      {/* Ограничиваем высоту фона SpaceTravel только для hero и верхней части 'Как это работает' */}
      <div className="absolute top-0 left-0 w-full" style={{ height: "calc(200vh)", pointerEvents: "none", zIndex: 0 }}>
        <WebGLBackground />
      </div>
      <Header onAuthClick={() => handleOpenAuth("login")} />
      <Hero onGetStarted={() => handleOpenAuth("signup")} />
      <HowItWorks />
      <AICenter />
      <OpenEcosystem />
      <div className="relative z-30">
        <Footer />
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} />
    </main>
  );
}
