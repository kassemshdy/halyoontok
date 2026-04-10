import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";

const comparisons = [
  { label: "Analytics Tools", what: "Shows you numbers", missing: "Doesn't tell you what content to create from them" },
  { label: "Social Listening", what: "Monitors mentions", missing: "Can't generate content from insights" },
  { label: "AI Video Tools", what: "Creates videos from prompts", missing: "Has no trend or performance intelligence" },
  { label: "Creator Research", what: "Finds influencers", missing: "Doesn't build a repeatable growth system" },
];

const halyoonDiff = [
  "Collects and structures real viral social data across all major platforms",
  "Classifies channels, styles, and content categories with AI precision",
  "Recommends what will work based on actual performance patterns",
  "Generates AI video content grounded in proven winning formats",
  "Feeds performance back into the system to keep improving automatically",
  "Powers full media products like Tfole Kids end-to-end",
];

export default function WhyHalyoon() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 bg-white">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#2A4F88", background: "rgba(10,0,126,0.06)", borderRadius: "2px" }}>
            Why Halyoon
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            Not a Tool.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #2A4F88, #2A4F88, #00FFD4)" }}>An Operating System for Growth</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Every other product solves one piece. Halyoon integrates the entire lifecycle — from data to creation to optimization.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-bold mb-5" style={{ color: "#2A4F88" }}>The competition falls short</h3>
            {comparisons.map((item) => (
              <div key={item.label} className="bg-gray-50 border border-gray-200 p-4" style={{ borderRadius: "2px", borderLeft: "3px solid #E85600" }}>
                <div className="flex items-start gap-3 mb-1.5">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#E85600" }} />
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "#2A4F88" }}>{item.label}</span>
                    <span className="text-xs text-gray-500 ml-2">— {item.what}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 pl-7">{item.missing}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="p-7 relative overflow-hidden"
            style={{ background: "#2A4F88", borderRadius: "2px" }}
          >
            <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, #00FFD4, transparent)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 flex items-center justify-center font-black text-sm" style={{ background: "rgba(0,188,158,0.2)", color: "#00FFD4", borderRadius: "2px" }}>H</div>
                <div>
                  <h3 className="text-base font-bold text-white">Halyoon is different</h3>
                  <p className="text-xs text-white/50">Integrated social growth infrastructure</p>
                </div>
              </div>
              <div className="space-y-4">
                {halyoonDiff.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 15 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(0,188,158,0.2)", borderRadius: "50%" }}>
                      <Check className="w-3 h-3" style={{ color: "#00FFD4" }} />
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
