"use client";

import Link from "next/link";

export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <html lang="en"><body className="min-h-screen bg-slate-50 text-slate-950 antialiased"><main className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-5 py-12 sm:px-6 lg:px-8"><section className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12" role="alert"><span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Service error</span><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Wallpaper is temporarily unavailable.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Please retry the page. If the issue continues, try again later.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800" type="button" onClick={()=>reset()}>Try again</button><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50" href="/">Go home</Link></div></section></main></body></html>;
}
