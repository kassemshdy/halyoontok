import React from "react";
import { ArrowRight, Twitter, Linkedin, Github } from "lucide-react";
import logoSvg from "@assets/logo.svg";

const navLinks = [
  { group: "Platform", links: ["Features", "How It Works", "Data Layer", "AI Generation", "Feedback Loop"] },
  { group: "Use Cases", links: ["Tfole Kids", "Brand Growth", "Creator Channels", "Agency Solutions", "Media Companies"] },
  { group: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
];

export default function Footer() {
  return (
    <footer className="pt-16 pb-8 px-6 border-t border-gray-200 bg-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-14">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src={logoSvg} alt="Halyoon" className="w-10 h-10 object-contain flex-shrink-0" />
              <div>
                <span className="font-bold text-lg tracking-widest leading-none block" style={{ color: "#2A4F88", letterSpacing: "0.12em" }}>HALYOON</span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium leading-none block" style={{ color: "#00FFD4" }}>Growth Engine</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              The data-driven social growth engine that turns viral trends into channel growth — for creators, brands, and media businesses.
            </p>
            <div className="flex items-center gap-2">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#2A4F88] hover:border-[#2A4F88]/30 transition-all duration-200"
                  style={{ borderRadius: "2px" }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {navLinks.map((group) => (
            <div key={group.group}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: "#2A4F88" }}>{group.group}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-[#2A4F88] transition-colors duration-200 hover:underline underline-offset-2">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 p-5 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ background: "rgba(10,0,126,0.02)", borderRadius: "2px" }}>
          <div>
            <h4 className="text-sm font-bold mb-1" style={{ color: "#2A4F88" }}>Stay in the loop</h4>
            <p className="text-xs text-gray-500">Get early access updates, product news, and growth intelligence insights.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-56 px-4 py-2 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#2A4F88]/40 transition-colors"
              style={{ borderRadius: "2px" }}
            />
            <button
              className="px-4 py-2 text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: "#2A4F88", borderRadius: "2px" }}
            >
              Subscribe <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            2026 Halyoon. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
              <a key={link} href="#" className="text-xs text-gray-400 hover:text-[#2A4F88] transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
