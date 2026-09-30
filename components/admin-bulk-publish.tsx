"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function AdminBulkPublish(){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function publishAll(){
    if(!window.confirm("Publish all pending-review wallpapers now?"))return;
    setBusy(true);setMessage("");
    try{
      const r=await fetch("/api/admin/wallpapers/publish-all",{method:"POST"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){setMessage(d.error||"Unable to publish pending wallpapers.");return;}
      setMessage("Published "+String(d.published||0)+" pending wallpapers.");
      router.refresh();
    }catch{setMessage("Network error. Try again.");}
    finally{setBusy(false);}
  }

  return <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
    <button className="btn btn-primary" disabled={busy} onClick={publishAll}>{busy?"Publishing…":"Publish all pending"}</button>
    {message?<span className="muted" style={{fontSize:12}}>{message}</span>:null}
  </div>;
}
