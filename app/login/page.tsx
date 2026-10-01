"use client";

import {FormEvent,useState} from "react";
import {signIn} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Input} from "@/components/ui";

export default function LoginPage(){
  const router=useRouter();const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError("");const result=await signIn("credentials",{email:email.trim(),password,redirect:false});if(result?.error){setError("Email or password is incorrect.");setBusy(false);return;}router.push("/account");router.refresh();}
  return <main className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)] lg:grid-cols-2">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(145deg,#eef2ff_0%,#f8fafc_55%,#ffffff_100%)] p-7 sm:p-10 lg:border-b-0 lg:border-r">
        <div className="relative flex min-h-[520px] flex-col justify-between gap-10">
          <div>
            <span className="inline-flex rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-600 backdrop-blur">Wallpaper SaaS</span>
            <h1 className="mt-6 max-w-lg text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl">Welcome back.</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600">Sign in to save wallpapers, view your download history, and access publisher tools when your account has publishing access.</p>
          </div>
          <div className="grid gap-2.5">
            {["Secure credentials login","Saved and downloaded wallpapers","Publisher workspace for approved accounts"].map(item=><div key={item} className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">✓ {item}</div>)}
          </div>
        </div>
      </section>
      <section className="flex items-center p-7 sm:p-10">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Account access</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use the email and password connected to your account.</p>
          <form onSubmit={submit} className="mt-7 grid gap-4">
            <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">Email</span><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required/></label>
            <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">Password</span><Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" type="password" autoComplete="current-password" required/></label>
            {error?<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-bold text-rose-700">{error}</div>:null}
            <button className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>
          </form>
          <p className="mt-5 text-sm text-slate-500">New here? <Link className="font-extrabold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700" href="/register">Create an account</Link></p>
        </div>
      </section>
    </div>
  </main>;
}
