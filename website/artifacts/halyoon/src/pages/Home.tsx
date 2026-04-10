import React from "react";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import WhatItDoes from "@/components/sections/WhatItDoes";
import HowItWorks from "@/components/sections/HowItWorks";
import TfoleKids from "@/components/sections/TfoleKids";
import Features from "@/components/sections/Features";
import WhyHalyoon from "@/components/sections/WhyHalyoon";
import WhoItsFor from "@/components/sections/WhoItsFor";
import Metrics from "@/components/sections/Metrics";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <div className="section-divider" />
        <Problem />
        <div className="section-divider" />
        <WhatItDoes />
        <div className="section-divider" />
        <HowItWorks />
        <div className="section-divider" />
        <TfoleKids />
        <div className="section-divider" />
        <Features />
        <div className="section-divider" />
        <WhyHalyoon />
        <div className="section-divider" />
        <WhoItsFor />
        <div className="section-divider" />
        <Metrics />
      </main>
      <FinalCTA />
      <Footer />
    </div>
  );
}
