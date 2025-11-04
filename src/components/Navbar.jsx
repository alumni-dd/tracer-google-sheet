import { useState } from "react";
import { Menu } from "lucide-react";

// Mengambil URL dari file .env
const HOME_URL    = import.meta.env.VITE_HOME_URL    || "#";
const KATALOG_URL = import.meta.env.VITE_CATALOG_URL || "#";
const NEWS_URL    = import.meta.env.VITE_NEWS_URL    || "#";
const TRACER_URL  = typeof window !== "undefined" ? window.location.origin + "/" : "/";

const normalize = (u) => (u || "").replace(/\/+$/, "");
const isActiveHref = (href) => normalize(href) === normalize(TRACER_URL);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const baseCls="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand";
  const activeCls="bg-brand text-white hover:opacity-90";
  const inactiveCls="text-slate-700 hover:bg-slate-100 hover:text-slate-900";
  const linkClass=(href)=> (isActiveHref(href)?`${baseCls} ${activeCls}`:`${baseCls} ${inactiveCls}`);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href={KATALOG_URL} className="flex items-center gap-3 shrink-0" aria-label="Beranda">
          <img src="https://i0.wp.com/greatedunesia.id/wp-content/uploads/2024/05/ico-ge.webp?w=495&ssl=1"
               alt="GREAT Edunesia" className="h-8 md:h-10 w-auto object-contain"
               loading="eager" decoding="async" fetchpriority="high"/>
          <img src="https://www.dompetdhuafa.org/wp-content/uploads/2023/11/logo-dd-palestina-semangka-160x60-3.jpg"
               alt="Dompet Dhuafa" className="h-8 md:h-10 w-auto object-contain"
               loading="lazy" decoding="async"/>
        </a>
        <nav className="hidden md:flex items-center gap-2">
          <a href={HOME_URL} className={linkClass(HOME_URL)}>Beranda</a>
          {/* LINK DATABASE DIHILANGKAN */}
          <a href={KATALOG_URL} className={linkClass(KATALOG_URL)}>Katalog</a>
          <a href={NEWS_URL} className={linkClass(NEWS_URL)}>Berita</a>
          <a href={TRACER_URL} className={linkClass(TRACER_URL)}>Tracer</a>
        </nav>
        <button className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-300"
                onClick={()=>setOpen(v=>!v)} aria-label="Buka menu" aria-expanded={open} aria-controls="mobile-menu">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-1">
            <a href={HOME_URL} className={linkClass(HOME_URL)} onClick={()=>setOpen(false)}>Beranda</a>
            {/* LINK DATABASE DIHILANGKAN */}
            <a href={KATALOG_URL} className={linkClass(KATALOG_URL)} onClick={()=>setOpen(false)}>Katalog</a>
            <a href={NEWS_URL} className={linkClass(NEWS_URL)} onClick={()=>setOpen(false)}>Berita</a>
            <a href={TRACER_URL} className={linkClass(TRACER_URL)} onClick={()=>setOpen(false)}>Tracer</a>
          </div>
        </div>
      )}
    </header>
  );
}