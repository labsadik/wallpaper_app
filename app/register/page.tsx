"use client";

import {FormEvent,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Input} from "@/components/ui";

export default function RegisterPage(){
  const router=useRouter();const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/auth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,email,password})});const data=await r.json().catch(()=>({}));if(!r.ok){setError(data.error||"Registration failed");return;}router.push("/login");}catch{setError("Network error. Try again.");}finally{setBusy(false);}}
  return <main className="mx-auto flex min-h-[calc(100vh-128px)] w-full max-w-[620px] items-center px-5 py-10 sm:px-6 lg:px-8">
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-9">
      <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Get started</span>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Create your account</h1>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">Start as a user. Publisher access can be granted by an admin.</p>
      <form onSubmit={submit} className="mt-7 grid gap-4">
        <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">Name</span><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required minLength={2}/></label>
        <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">Email</span><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required autoComplete="email"/></label>
        <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">Password</span><Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" type="password" required minLength={8} autoComplete="new-password"/></label>
        {error?<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-bold text-rose-700">{error}</div>:null}
        <button className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy}>{busy?"Creating…":"Create account"}</button>
      </form>
      <p className="mt-5 text-sm text-slate-500">Already registered? <Link className="font-extrabold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700" href="/login">Login</Link></p>
    </section>
  </main>;
}
