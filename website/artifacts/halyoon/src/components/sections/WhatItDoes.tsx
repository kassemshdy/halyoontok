import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Database, Search, Video, RefreshCw } from "lucide-react";

const pillars = [
  {
    icon: Database,
    number: "01",
    title: "Data Layer",
    accentColor: "#2A4F88",
    bgColor: "rgba(10,0,126,0.06)",
    desc: "Continuously collects influencer, channel, and viral video data across TikTok, YouTube Shorts, and Instagram Reels — structured, labeled, and ready for intelligence extraction.",
    tags: ["TikTok", "YouTube Shorts", "Instagram Reels"],
  },
  {
    icon: Search,
    number: "02",
    title: "Search & Recommendation Engine",
    accentColor: "#00FFD4",
    bgColor: "rgba(0,188,158,0.06)",
    desc: "Finds similar channels, top-performing content patterns, categories, formats, and styles most likely to work — intelligently ranked for any target audience or vertical.",
    tags: ["Pattern Matching", "Category Analysis", "Style Ranking"],
  },
  {
    icon: Video,
    number: "03",
    title: "AI Video Generation",
    accentColor: "#2A4F88",
    bgColor: "rgba(87,85,217,0.06)",
    desc: "Generates new videos based on reference videos, natural language prompts, content style and category, and selected AI model parameters — at scale.",
    tags: ["Prompt-to-Video", "Reference-Based", "Multi-Model"],
  },
  {
    icon: RefreshCw,
    number: "04",
    title: "Feedback Loop",
    accentColor: "#E85600",
    bgColor: "rgba(232,86,0,0.06)",
    desc: "Re-fetches channel and performance data to continuously improve recommendations, refine prompt quality, and optimize AI model parameters through real-world feedback.",
    tags: ["Performance Learning", "Prompt Optimization", "Continuous Improvement"],
  },
];

export default function WhatItDoes() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="platform" className="py-24 px-6 bg-white">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#2A4F88", background: "rgba(10,0,126,0.06)", borderRadius: "2px" }}>
            What Halyoon Does
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            Four Core Pillars of{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #2A4F88, #00FFD4)" }}>Social Growth Intelligence</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Each layer works in concert — from raw data collection to AI-generated output, continuously refined by performance signal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="bg-white border border-gray-200 p-7 group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{ borderRadius: "2px", borderLeftWidth: "3px", borderLeftColor: pillar.accentColor }}
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: pillar.bgColor, borderRadius: "2px" }}>
                  <pillar.icon className="w-6 h-6" style={{ color: pillar.accentColor }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono font-bold opacity-40" style={{ color: pillar.accentColor }}>{pillar.number}</span>
                    <h3 className="text-lg font-bold" style={{ color: "#2A4F88" }}>{pillar.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm mb-4">{pillar.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 font-medium" style={{ background: pillar.bgColor, color: pillar.accentColor, borderRadius: "2px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
