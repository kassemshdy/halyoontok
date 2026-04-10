import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Calendar, Mail } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="py-24 px-6 relative overflow-hidden" style={{ background: "#1a3360" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #00FFD4, transparent)", transform: "translate(20%, -20%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #41E9CD, transparent)", transform: "translate(-20%, 20%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px)" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border" style={{ borderColor: "rgba(0,188,158,0.4)", background: "rgba(0,188,158,0.08)", borderRadius: "2px" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00FFD4" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00FFD4" }}>Ready to Scale</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Build Your Next{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FFD4, #41E9CD)" }}>Social Growth Engine</span>{" "}
            With Halyoon
          </h2>

          <p className="text-lg text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed">
            Use Halyoon to discover viral patterns, generate content intelligently, and power new media products like Tfole Kids. The platform is ready — your channel growth strategy starts here.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 group"
              style={{ background: "#00FFD4", borderRadius: "50px" }}
            >
              <Calendar className="w-5 h-5" />
              Book a Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 border-2"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.3)", borderRadius: "2px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/45">
            {["No commitment required", "Tailored onboarding", "For teams of any size"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FFD4" }} />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
