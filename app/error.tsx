"use client";

import {useEffect} from "react";
import Link from "next/link";

export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
  useEffect(()=>{console.error(error);},[error]);
  return <main className="mx-auto flex min-h-[calc(100vh-128px)] w-full max-w-[760px] items-center px-5 py-12 sm:px-6 lg:px-8"><section className="w-full rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-12" role="alert"><span className="text-xs font-extrabold uppercase tracking-[0.14em] text-rose-600">Something went wrong</span><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">We could not load this page.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">The problem was recorded on the server. Retry the page or return to the wallpaper collection.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800" type="button" onClick={()=>reset()}>Try again</button><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50" href="/items">Browse wallpapers</Link></div></section></main>;
}
