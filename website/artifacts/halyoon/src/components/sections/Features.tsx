import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Flame, Library, UserCheck, Palette, Wand2, Film, SlidersHorizontal, RotateCcw, MapPin, Rocket } from "lucide-react";

const features = [
  { icon: Flame, title: "Viral Trend Intelligence", desc: "Real-time detection of emerging trends before they peak.", color: "#2A4F88" },
  { icon: Library, title: "Cross-Platform Channel Library", desc: "Searchable database of channels across TikTok, Reels, and Shorts.", color: "#00FFD4" },
  { icon: UserCheck, title: "Influencer Classification", desc: "Automated tagging of creators by niche, style, and performance tier.", color: "#2A4F88" },
  { icon: Palette, title: "Category & Style Analysis", desc: "Deep content categorization across formats, tones, and visual styles.", color: "#E85600" },
  { icon: Wand2, title: "AI Prompt-to-Video Workflow", desc: "Turn a text prompt into a production-ready video using proven patterns.", color: "#2A4F88" },
  { icon: Film, title: "Reference-to-Video Generation", desc: "Use any viral video as a style reference to generate original content.", color: "#00FFD4" },
  { icon: SlidersHorizontal, title: "Recommendation Optimization", desc: "Smart ranking of content formats by predicted performance.", color: "#2A4F88" },
  { icon: RotateCcw, title: "Feedback-Based Learning Loop", desc: "Performance signals continuously refine the recommendation engine.", color: "#E85600" },
  { icon: MapPin, title: "Arabic-First / MENA Insights", desc: "Specialized trend data and models for the Arabic-speaking market.", color: "#2A4F88" },
  { icon: Rocket, title: "Scalable Content Engine", desc: "Built to generate and manage content at enterprise scale.", color: "#00FFD4" },
];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 px-6" style={{ background: "#F8F8FC" }}>
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ color: "#2A4F88", background: "rgba(87,85,217,0.08)", borderRadius: "2px" }}>
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ color: "#2A4F88" }}>
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #2A4F88, #00FFD4)" }}>Own Your Niche</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Halyoon's platform is built from the ground up to give growth teams, brands, and media businesses an unfair advantage.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="bg-white border border-gray-200 p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              style={{ borderRadius: "2px" }}
            >
              <div className="w-9 h-9 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: `${feature.color}0F`, borderRadius: "2px" }}>
                <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
              </div>
              <h3 className="text-sm font-bold mb-2 leading-snug" style={{ color: "#2A4F88" }}>{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
