import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, BookOpen, Globe, Layers, Brain, ArrowRight } from "lucide-react";

const features = [
  { icon: Shield, title: "Child-Safe Feed", desc: "Zero harmful content. Every video moderated and verified before delivery." },
  { icon: BookOpen, title: "Educational & Entertaining", desc: "Smart injection of educational content between engaging, fun video segments." },
  { icon: Globe, title: "Arabic-First, MENA-Focused", desc: "Built for Arabic-speaking children with culturally relevant, region-first content." },
  { icon: Layers, title: "Controlled Content Generation", desc: "All AI-generated videos reviewed, categorized, and moderated for child safety." },
  { icon: Brain, title: "Halyoon-Powered Intelligence", desc: "Recommendations, trends, and generation all run on Halyoon's core engine." },
];

export default function TfoleKids() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #00FFD4, #2A4F88, transparent)" }} />
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border" style={{ borderColor: "#00FFD4", background: "rgba(0,188,158,0.06)", borderRadius: "2px" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00FFD4" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00FFD4" }}>First Use Case Powered by Halyoon</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>Tfole Kids</h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              The first application built entirely on Halyoon's intelligence engine — a child-safe short-video feed delivering safe, educational, and engaging content for children.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="p-6 border relative overflow-hidden" style={{ background: "#2A4F88", borderRadius: "2px" }}>
                <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, #00FFD4, transparent)" }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 flex items-center justify-center mb-5 font-black text-2xl" style={{ background: "rgba(0,188,158,0.2)", color: "#00FFD4", borderRadius: "2px" }}>
                    TK
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Tfole Kids</h3>
                  <p className="text-sm text-white/65 leading-relaxed mb-6">
                    A thoughtfully designed short-video platform for children that eliminates the chaotic, unsafe patterns of mainstream social media — replacing them with curated, enriching content experiences powered by Halyoon.
                  </p>
                  <div className="p-3 mb-5 text-xs italic" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", borderRadius: "2px", borderLeft: "2px solid #00FFD4" }}>
                    "Tfole Kids is built on top of Halyoon — not the other way around. Halyoon is the engine that powers it."
                  </div>
                  <a
                    href="#"
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 group"
                    style={{ background: "rgba(0,188,158,0.15)", color: "#00FFD4", border: "1px solid rgba(0,188,158,0.3)", borderRadius: "2px" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#00FFD4"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,188,158,0.15)"; (e.currentTarget as HTMLElement).style.color = "#00FFD4"; }}
                  >
                    Learn About Tfole Kids
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 grid gap-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.09 }}
                  className="bg-white border border-gray-200 p-5 flex items-start gap-4 group hover:border-[#00FFD4]/40 hover:shadow-sm transition-all duration-300"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: "rgba(0,188,158,0.08)", borderRadius: "2px" }}>
                    <feature.icon className="w-5 h-5" style={{ color: "#00FFD4" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: "#2A4F88" }}>{feature.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
