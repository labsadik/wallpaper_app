"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function PublisherWallpaperActions({wallpaperId,status}:{wallpaperId:string;status:string}){
  const router=useRouter(),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function publish(){setBusy(true);setMessage("");try{const r=await fetch("/api/publisher/wallpapers/"+wallpaperId,{method:"POST"});const d=await r.json().catch(()=>({}));if(!r.ok){setMessage(d.error||"Unable to publish.");return;}setMessage("Published and visible to everyone.");router.refresh();}catch{setMessage("Network error. Try again.");}finally{setBusy(false);}}
  async function remove(){if(!window.confirm("Delete this wallpaper from the public site?"))return;setBusy(true);setMessage("");try{const r=await fetch("/api/publisher/wallpapers/"+wallpaperId,{method:"DELETE"});const d=await r.json().catch(()=>({}));if(!r.ok){setMessage(d.error||"Unable to delete.");return;}setMessage("Wallpaper removed.");router.refresh();}catch{setMessage("Network error. Try again.");}finally{setBusy(false);}}
  return <div className="flex flex-wrap items-center gap-2">{status==="pending_review"?<button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} onClick={publish}>{busy?"Publishing…":"Publish now"}</button>:null}{status!=="archived"?<button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} onClick={remove}>{busy?"Deleting…":"Delete"}</button>:null}{message?<span className="text-xs font-semibold text-slate-500" role="status">{message}</span>:null}</div>;
}