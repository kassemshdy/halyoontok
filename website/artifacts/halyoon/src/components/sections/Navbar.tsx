import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logoSvg from "@assets/logo.svg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(42,79,136,0.08)] border-b border-[#2A4F88]/10"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 h-18 flex items-center justify-between" style={{ height: "72px" }}>
        <a href="#" className="flex items-center gap-3 group">
          <img
            src={logoSvg}
            alt="Halyoon Logo"
            className="w-10 h-10 flex-shrink-0 object-contain"
          />
          <span className="font-bold text-xl tracking-widest leading-none" style={{ color: "#2A4F88", letterSpacing: "0.12em" }}>HALYOON</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {["Platform", "Use Cases", "Features", "How It Works", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "#2A4F88" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00FFD4")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#2A4F88")}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold border-2 transition-all duration-200"
            style={{ color: "#2A4F88", borderColor: "#2A4F88", borderRadius: "50px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2A4F88"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#2A4F88"; }}
          >
            Contact
          </a>
          <a
            href="#contact"
            className="inline-flex items-center px-5 py-2 text-sm font-bold transition-all duration-200 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00FFD4, #41E9CD)", color: "#1a3a6a", borderRadius: "2px" }}
          >
            Request Demo
          </a>
        </div>
      </div>
    </motion.header>
  );
}
