"use client";

import {useState} from "react";

export default function ProfileShareButton({username,name}:{username:string;name:string}){
  const [status,setStatus]=useState(""),[busy,setBusy]=useState(false);
  async function share(){if(busy)return;setBusy(true);try{const url=new URL("/profile/"+username,window.location.origin).toString();if(navigator.share){await navigator.share({title:name+" · Wallpaper profile",text:"View "+name+"'s Wallpaper profile.",url});setStatus("Shared");}else if(navigator.clipboard){await navigator.clipboard.writeText(url);setStatus("Link copied");setTimeout(()=>setStatus(""),1600);}}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setStatus("Unable to share");}finally{setBusy(false);}}
  return <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60" onClick={share} disabled={busy}>{busy?"Sharing…":status||"↗ Share profile"}</button>;
}