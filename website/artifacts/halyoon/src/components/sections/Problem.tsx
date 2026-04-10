import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AlertTriangle, TrendingDown, Clock, Layers, Shuffle } from "lucide-react";

const problems = [
  { icon: AlertTriangle, title: "Blind to What Goes Viral", desc: "No clear understanding of why certain videos explode while others disappear immediately." },
  { icon: TrendingDown, title: "Trends Missed in Real-Time", desc: "Social trends peak and die in hours. Without tracking, brands always arrive late." },
  { icon: Layers, title: "No Winning Style Playbook", desc: "Creators guess at formats and categories instead of knowing which patterns consistently perform." },
  { icon: Clock, title: "Inconsistent Content Output", desc: "Scaling quality content production manually is expensive, slow, and unsustainable." },
  { icon: Shuffle, title: "No Learning From Performance", desc: "Most tools don't feed performance data back into content strategy, repeating the same mistakes." },
];

export default function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="use-cases" className="py-24 px-6 relative" style={{ background: "#F8F8FC" }}>
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#E85600", background: "rgba(232,86,0,0.08)", borderRadius: "2px" }}>
            The Problem
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            Social Growth Is Broken for{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #E85600, #2A4F88)" }}>Most Brands</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Creators, brands, and media companies pour resources into social content — yet channel growth remains elusive, unpredictable, and exhausting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              className="bg-white border border-gray-200 p-6 group hover:border-[#E85600]/30 hover:shadow-md transition-all duration-300"
              style={{ borderRadius: "2px" }}
            >
              <div className="w-10 h-10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: "rgba(232,86,0,0.08)", borderRadius: "2px" }}>
                <p.icon className="w-5 h-5" style={{ color: "#E85600" }} />
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "#2A4F88" }}>{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative p-8 md:p-12 text-center overflow-hidden"
          style={{ background: "#2A4F88", borderRadius: "2px" }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 70% 50%, #00FFD4, transparent)" }} />
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">
            Halyoon solves this with{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #00FFD4, #41E9CD)" }}>Data + AI + Optimization</span>
          </h3>
          <p className="text-white/70 max-w-2xl mx-auto text-base relative z-10 leading-relaxed">
            A unified intelligence layer that collects viral data, classifies winning patterns, generates proven content with AI, and continuously improves through performance feedback.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
