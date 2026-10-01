"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function AdminWallpaperActions({wallpaperId,status}:{wallpaperId:string;status:string}){
  const router=useRouter(),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function update(action:"publish"|"remove"|"restore"){setBusy(true);setMessage("");try{const response=await fetch("/api/admin/wallpapers/"+wallpaperId,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action,reason:action==="remove"?"Removed by administrator":undefined})});const data=await response.json().catch(()=>({}));if(!response.ok){setMessage(data.error||"Unable to update wallpaper.");return;}setMessage(action==="publish"?"Published. It is now visible in the public gallery and publisher view.":action==="remove"?"Removed from public view.":"Moved back to pending review.");router.refresh();}catch{setMessage("Network error. Try again.");}finally{setBusy(false);}}
  const action=status==="pending_review"?"publish":status==="archived"?"restore":"remove";
  return <div className="grid min-w-[132px] gap-2"><button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} onClick={()=>update(action)}>{busy?"Saving…":action==="publish"?"Publish":action==="restore"?"Send to review":"Remove post"}</button>{message?<span className="text-xs font-semibold leading-5 text-slate-500" role="status">{message}</span>:null}</div>;
}