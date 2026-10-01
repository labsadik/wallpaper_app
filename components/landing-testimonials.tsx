const TESTIMONIALS=[{quote:"The feed feels calm and visual. I can scan images first and open the ones that earn a closer look.",name:"Maya R.",role:"Early creator"},{quote:"I like that the publisher identity stays connected to every item instead of disappearing behind the image.",name:"Daniel K.",role:"Wallpaper collector"},{quote:"The profile view makes publishing feel like a real creative home, not just an upload form.",name:"Aarav S.",role:"Independent publisher"}] as const;

export default function LandingTestimonials(){
  return <section className="border-b border-slate-200 bg-slate-50">
    <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
      <div><span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Community</span><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">Made for people who notice the details.</h2></div>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">{TESTIMONIALS.map(item=><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={item.name}><span className="text-4xl font-black leading-none text-slate-200">“</span><p className="mt-2 text-sm leading-7 text-slate-600">{item.quote}</p><div className="mt-5 border-t border-slate-100 pt-3"><strong className="block text-sm font-black text-slate-900">{item.name}</strong><span className="mt-0.5 block text-xs font-semibold text-slate-500">{item.role}</span></div></article>)}</div>
    </div>
  </section>;
}