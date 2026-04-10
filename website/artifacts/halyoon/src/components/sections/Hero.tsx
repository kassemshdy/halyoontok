import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, BarChart3, Users, Zap, Activity } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-44 md:pb-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #2A4F88, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #00FFD4, transparent)", transform: "translate(-20%, 20%)" }} />
      </div>

      <div className="container mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border text-xs font-semibold uppercase tracking-widest" style={{ borderColor: "#00FFD4", color: "#00FFD4", borderRadius: "2px", background: "rgba(0,188,158,0.06)" }}>
              <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#00FFD4" }} />
              Tfole Kids — First Use Case Powered by Halyoon
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight" style={{ color: "#2A4F88" }}>
              Turn Social <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FFD4, #2A4F88)" }}>Trends</span>{" "}
              Into Channel Growth
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl font-normal">
              Halyoon is a data-driven social growth engine that analyzes viral content patterns, classifies winning styles, and uses AI to generate videos that help people and brands build successful social media channels.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-lg group"
                style={{ background: "#2A4F88", borderRadius: "2px", boxShadow: "0 8px 24px rgba(10,0,126,0.25)" }}
              >
                Request Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#platform"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold border-2 transition-all duration-200 hover:-translate-y-0.5"
                style={{ color: "#2A4F88", borderColor: "#2A4F88", borderRadius: "2px" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2A4F88"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#2A4F88"; }}
              >
                Explore Platform
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm" style={{ color: "#2A4F88" }}>
              {["TikTok", "YouTube Shorts", "Instagram Reels"].map((p) => (
                <div key={p} className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#00FFD4" }} />
                  {p}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-sm opacity-20" style={{ background: "linear-gradient(135deg, #2A4F8820, #00FFD420)" }} />

            <div className="relative bg-white border border-gray-200 shadow-2xl overflow-hidden" style={{ borderRadius: "2px", boxShadow: "0 24px 60px rgba(10,0,126,0.14)" }}>
              <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-2" style={{ background: "#2A4F88" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="ml-3 text-xs font-mono text-white/60 flex-1 text-center">app.halyoon.com/intelligence</div>
              </div>

              <div className="p-5 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#2A4F88" }}>
                    <TrendingUp className="w-4 h-4" style={{ color: "#00FFD4" }} />
                    Active Trend Signals
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5" style={{ color: "#00FFD4", background: "rgba(0,188,158,0.1)", borderRadius: "2px" }}>Live</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white border border-gray-100 p-3" style={{ borderRadius: "2px" }}>
                    <div className="text-xs text-gray-500 mb-1 font-medium">Velocity</div>
                    <div className="text-xl font-bold flex items-baseline gap-1" style={{ color: "#2A4F88" }}>
                      +482% <span className="text-xs font-normal" style={{ color: "#00FFD4" }}>12h</span>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3" style={{ borderRadius: "2px" }}>
                    <div className="text-xs text-gray-500 mb-1 font-medium">Saturation</div>
                    <div className="text-xl font-bold" style={{ color: "#E85600" }}>Low</div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 mb-4" style={{ borderRadius: "2px" }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-gray-500">Pattern Recognition</span>
                    <Activity className="w-4 h-4" style={{ color: "#2A4F88" }} />
                  </div>
                  <div className="h-14 flex items-end gap-1">
                    {[40, 25, 60, 30, 80, 45, 90, 65, 100, 72, 55, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: "10%" }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 2, delay: 0.3 + i * 0.08, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="flex-1 rounded-sm"
                        style={{ background: i % 3 === 0 ? "#2A4F88" : i % 3 === 1 ? "#00FFD4" : "#2A4F88", opacity: 0.7 + (h / 100) * 0.3 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border" style={{ background: "rgba(0,188,158,0.06)", borderColor: "#00FFD4", borderRadius: "2px" }}>
                  <div className="w-8 h-8 flex items-center justify-center" style={{ background: "#00FFD4", borderRadius: "2px" }}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold" style={{ color: "#2A4F88" }}>AI Generation Ready</div>
                    <div className="text-[10px] text-gray-500">Pattern matched. 3 variations available.</div>
                  </div>
                  <button className="px-3 py-1.5 text-[11px] font-semibold text-white" style={{ background: "#2A4F88", borderRadius: "2px" }}>Generate</button>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-16 bg-white border border-gray-200 p-3 flex items-center gap-3 shadow-lg"
              style={{ borderRadius: "2px" }}
            >
              <div className="w-8 h-8 flex items-center justify-center" style={{ background: "rgba(0,188,158,0.12)", borderRadius: "2px" }}>
                <BarChart3 className="w-4 h-4" style={{ color: "#00FFD4" }} />
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#2A4F88" }}>Engagement</div>
                <div className="text-xs font-bold" style={{ color: "#00FFD4" }}>+12.4M</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-4 bottom-24 bg-white border border-gray-200 p-3 flex items-center gap-3 shadow-lg"
              style={{ borderRadius: "2px" }}
            >
              <div className="w-8 h-8 flex items-center justify-center" style={{ background: "rgba(10,0,126,0.08)", borderRadius: "2px" }}>
                <Users className="w-4 h-4" style={{ color: "#2A4F88" }} />
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#2A4F88" }}>Audience Match</div>
                <div className="text-xs font-bold" style={{ color: "#2A4F88" }}>94.2%</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
