"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function PublisherWallpaperActions({wallpaperId,status}:{wallpaperId:string;status:string}){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function publish(){
    setBusy(true);setMessage("");
    try{
      const r=await fetch("/api/publisher/wallpapers/"+wallpaperId,{method:"POST"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){setMessage(d.error||"Unable to publish.");return;}
      setMessage("Published and visible to everyone.");
      router.refresh();
    }catch{setMessage("Network error. Try again.");}
    finally{setBusy(false);}
  }

  async function remove(){
    if(!window.confirm("Delete this wallpaper from the public site?"))return;
    setBusy(true);setMessage("");
    try{
      const r=await fetch("/api/publisher/wallpapers/"+wallpaperId,{method:"DELETE"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){setMessage(d.error||"Unable to delete.");return;}
      setMessage("Wallpaper removed.");
      router.refresh();
    }catch{setMessage("Network error. Try again.");}
    finally{setBusy(false);}
  }

  return <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
    {status==="pending_review"?<button className="btn btn-primary" disabled={busy} onClick={publish}>{busy?"Publishing…":"Publish now"}</button>:null}
    {status!=="archived"?<button className="btn" disabled={busy} onClick={remove}>{busy?"Deleting…":"Delete"}</button>:null}
    {message?<span className="muted" role="status" style={{fontSize:12}}>{message}</span>:null}
  </div>;
}
