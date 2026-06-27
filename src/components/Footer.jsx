import React from "react";

export default function Footer({ isLoginMode = false }) {
  const footerLinks = [
    "FAQ",
    "Help Center",
    "Account",
    "Media Center",
    "Investor Relations",
    "Jobs",
    "Redeem Gift Cards",
    "Buy Gift Cards",
    "Ways to Watch",
    "Terms of Use",
    "Privacy",
    "Cookie Preferences",
    "Corporate Information",
    "Contact Us",
    "Speed Test",
    "Legal Notices",
    "Only on datafix"
  ];

  return (
    <footer
      id="datafix-footer"
      className={`w-full py-8 text-zinc-500 transition-all ${
        isLoginMode
          ? "border-t border-zinc-800/80 bg-black/75 px-4 pb-12 pt-10 sm:px-12"
          : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20"
      }`}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Support contact info */}
        <p className="text-sm font-medium hover:underline cursor-pointer">
          Questions? Call <span className="text-zinc-400">1-800-892-0000 (Mock Support)</span>
        </p>

        {/* Dense responsive link columns */}
        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3 md:grid-cols-4">
          {footerLinks
            .slice(0, isLoginMode ? 12 : footerLinks.length)
            .map((link) => (
              <a
                key={link}
                href="#footer-link-action"
                onClick={(e) => e.preventDefault()}
                className="hover:underline transition-colors hover:text-zinc-300"
              >
                {link}
              </a>
            ))}
        </div>

        {/* Simulated localization select list */}
        <div className="pt-2">
          <select className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400 outline-none focus:border-zinc-500">
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Branding note */}
        <div className="text-[11px] text-zinc-600 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 pt-4">
          <p>© 2026 datafix Replica. Developed with full-stack React & Express.</p>
          <div className="flex items-center space-x-3">
            <span className="px-1.5 py-0.5 rounded border border-zinc-800 text-[9px] uppercase tracking-widest font-mono text-zinc-600">
              CORS Secure
            </span>
            <span className="px-1.5 py-0.5 rounded border border-zinc-800 text-[9px] uppercase tracking-widest font-mono text-zinc-600">
              Node In-Memory DB
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
