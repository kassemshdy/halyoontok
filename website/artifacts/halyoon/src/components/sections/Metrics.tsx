import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, TrendingUp, Video, Brain, BarChart3 } from "lucide-react";

const metrics = [
  { icon: Zap, stat: "10x", label: "Faster Trend Discovery", desc: "Identify viral patterns hours before they hit mainstream awareness.", color: "#2A4F88" },
  { icon: TrendingUp, stat: "3–5x", label: "Channel Growth Rate", desc: "Brands using data-driven strategies grow significantly faster than organic-only teams.", color: "#00FFD4" },
  { icon: Video, stat: "80%", label: "AI-Assisted Production", desc: "Reduce content production time with AI generation grounded in proven formats.", color: "#2A4F88" },
  { icon: Brain, stat: "94%", label: "Style Match Accuracy", desc: "Recommendation engine achieves high accuracy matching content style to target audience.", color: "#E85600" },
  { icon: BarChart3, stat: "2x", label: "Optimization Cycle Speed", desc: "Feedback loops cut the time from publish to data-informed strategy update.", color: "#2A4F88" },
];

export default function Metrics() {
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
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#2A4F88", background: "rgba(87,85,217,0.08)", borderRadius: "2px" }}>
            Outcomes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            The Numbers Behind{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #2A4F88, #00FFD4)" }}>Better Growth</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Halyoon is designed to produce measurable, compounding improvement across every dimension of social growth.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-gray-200 p-6 text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default relative overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: metric.color }} />
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ background: `${metric.color}0F`, borderRadius: "2px" }}>
                <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              <div className="text-4xl font-black mb-2" style={{ color: metric.color }}>
                {metric.stat}
              </div>
              <h3 className="text-xs font-bold mb-2 leading-snug" style={{ color: "#2A4F88" }}>{metric.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{metric.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
