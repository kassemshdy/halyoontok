import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Download, Tag, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  { icon: Download, step: "01", title: "Collect Viral Social Data", desc: "Halyoon continuously harvests video, channel, and engagement data from TikTok, YouTube Shorts, and Instagram Reels across categories, languages, and regions.", color: "#2A4F88" },
  { icon: Tag, step: "02", title: "Classify Channels, Categories & Trends", desc: "AI-powered classification maps channels and videos to content styles, trend categories, performance tiers, and engagement patterns that define what works.", color: "#00FFD4" },
  { icon: Sparkles, step: "03", title: "Generate Videos With AI", desc: "Select proven patterns, add your prompt or reference video, choose your AI model, and let Halyoon generate content aligned with winning styles and formats.", color: "#2A4F88" },
  { icon: TrendingUp, step: "04", title: "Optimize Through Feedback", desc: "Performance data flows back into the system — refining recommendations, improving prompts, and updating model parameters based on what actually grows channels.", color: "#E85600" },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 px-6 relative" style={{ background: "#F8F8FC" }}>
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#00FFD4", background: "rgba(0,188,158,0.08)", borderRadius: "2px" }}>
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            Four Steps From{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FFD4, #2A4F88)" }}>Data to Growth</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            A structured, intelligent workflow that converts raw social data into channel growth — automatically improving with every cycle.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[72px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-0.5" style={{ background: "linear-gradient(90deg, #2A4F88, #00FFD4, #2A4F88, #E85600)" }} />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.13 }}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className="relative w-16 h-16 flex items-center justify-center mb-6 z-10 group-hover:scale-105 transition-transform duration-300 shadow-md"
                  style={{ background: step.color, borderRadius: "2px" }}
                >
                  <step.icon className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 text-[10px] font-bold flex items-center justify-center bg-white border-2" style={{ borderColor: step.color, color: step.color, borderRadius: "50%" }}>
                    {i + 1}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-5 w-full group-hover:shadow-md transition-all duration-300" style={{ borderRadius: "2px" }}>
                  <div className="text-[10px] font-bold mb-2 opacity-40" style={{ color: step.color }}>{step.step}</div>
                  <h3 className="text-sm font-bold mb-3 leading-snug" style={{ color: "#2A4F88" }}>{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
