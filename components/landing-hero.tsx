import Link from "next/link";

export default function LandingHero(){
  return <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,#eef2ff_0%,transparent_38%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)]">
    <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-600 shadow-sm">A visual home for wallpapers</span>
      <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.96] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">Discover images that make every screen feel like yours.</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">High-quality PC, tablet and mobile artwork in one focused place—published by people, organized by titles, and ready to view, save, share or download.</p>
      <div className="mt-8 flex flex-wrap gap-2.5"><Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-px hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" href="/items">Explore items</Link><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" href="/register">Create profile</Link></div>
      <div className="mt-8 grid max-w-3xl grid-cols-1 gap-2 text-xs font-bold text-slate-500 sm:grid-cols-2 lg:grid-cols-4">{["Natural image sizes","Secure media delivery","Publisher profiles","Follow & discover"].map(item=><div className="rounded-xl border border-slate-200/80 bg-white/75 px-3.5 py-3 shadow-sm backdrop-blur" key={item}><span className="mr-2 text-slate-900">✓</span>{item}</div>)}</div>
    </div>
  </section>;
}