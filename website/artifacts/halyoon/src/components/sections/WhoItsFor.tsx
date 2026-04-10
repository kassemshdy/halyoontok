import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { User, Building2, Megaphone, Tv, Film, Layers, TrendingUp } from "lucide-react";

const audiences = [
  { icon: User, title: "Creators", desc: "Individual creators who want to understand what goes viral and build a consistent growing channel strategy.", color: "#2A4F88" },
  { icon: Building2, title: "Brands", desc: "Consumer and B2B brands building an authentic social presence with proven, data-backed content.", color: "#00FFD4" },
  { icon: Megaphone, title: "Agencies", desc: "Growth agencies managing multiple client channels who need scalable intelligence and production pipelines.", color: "#2A4F88" },
  { icon: Tv, title: "Media Companies", desc: "Digital media publishers and OTT platforms expanding their short-form content reach and engagement.", color: "#E85600" },
  { icon: Film, title: "Studios", desc: "Production studios building IP-driven channels and scaling output through AI-assisted creation.", color: "#2A4F88" },
  { icon: Layers, title: "Vertical Products", desc: "Teams building niche media products — like Tfole Kids — powered by Halyoon's full stack.", color: "#00FFD4" },
  { icon: TrendingUp, title: "Content Growth Teams", desc: "In-house teams inside companies seeking a systematic, AI-powered approach to social channel growth.", color: "#2A4F88" },
];

export default function WhoItsFor() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6" style={{ background: "#F8F8FC" }}>
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#00FFD4", background: "rgba(0,188,158,0.08)", borderRadius: "2px" }}>
            Who It's For
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            Built for Everyone Who Wants to{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FFD4, #2A4F88)" }}>Win on Social</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            From individual creators to enterprise media companies — Halyoon scales to meet any team where they are.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {audiences.map((audience, i) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border border-gray-200 p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              style={{ borderRadius: "2px", borderTop: `3px solid ${audience.color}` }}
            >
              <div className="w-10 h-10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: `${audience.color}0F`, borderRadius: "2px" }}>
                <audience.icon className="w-5 h-5" style={{ color: audience.color }} />
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "#2A4F88" }}>{audience.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{audience.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
