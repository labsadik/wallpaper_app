"use client";

import {useState} from "react";

export default function ShareButton({title,href}:{title:string;href:string}){
  const [status,setStatus]=useState("");
  async function share(){const url=new URL(href,window.location.origin).toString();if(navigator.share){await navigator.share({title,url}).catch(()=>{});return;}if(navigator.clipboard){await navigator.clipboard.writeText(url);setStatus("Copied");setTimeout(()=>setStatus(""),1400);}}
  return <button className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" onClick={share} aria-label={"Share "+title}>{status||"↗ Share"}</button>;
}