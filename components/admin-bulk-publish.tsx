"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function AdminBulkPublish(){
  const router=useRouter(),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function publishAll(){if(!window.confirm("Publish all pending-review wallpapers now?"))return;setBusy(true);setMessage("");try{const r=await fetch("/api/admin/wallpapers/publish-all",{method:"POST"}),d=await r.json().catch(()=>({}));if(!r.ok){setMessage(d.error||"Unable to publish pending wallpapers.");return;}setMessage("Published "+String(d.published||0)+" pending wallpapers.");router.refresh();}catch{setMessage("Network error. Try again.");}finally{setBusy(false);}}
  return <div className="flex flex-wrap items-center gap-2"><button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} onClick={publishAll}>{busy?"Publishing…":"Publish all pending"}</button>{message?<span className="text-xs font-bold text-slate-500" role="status">{message}</span>:null}</div>;
}