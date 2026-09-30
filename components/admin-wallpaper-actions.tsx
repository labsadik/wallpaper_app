"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function AdminWallpaperActions({wallpaperId,status}:{wallpaperId:string;status:string}){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function update(action:"publish"|"remove"|"restore"){
    setBusy(true);
    setMessage("");
    try{
      const response=await fetch("/api/admin/wallpapers/"+wallpaperId,{
        method:"PATCH",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({action,reason:action==="remove"?"Removed by administrator":undefined})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        setMessage(data.error||"Unable to update wallpaper.");
        return;
      }
      setMessage(
        action==="publish"
          ?"Published. It is now visible in the public gallery and publisher view."
          :action==="remove"
            ?"Removed from public view."
            :"Moved back to pending review."
      );
      router.refresh();
    }catch{
      setMessage("Network error. Try again.");
    }finally{
      setBusy(false);
    }
  }

  const action=status==="pending_review"
    ?"publish"
    :status==="archived"
      ?"restore"
      :"remove";

  return <div style={{display:"grid",gap:7}}>
    <button className="btn btn-primary" disabled={busy} onClick={()=>update(action)}>
      {busy
        ?"Saving…"
        :action==="publish"
          ?"Publish"
          :action==="restore"
            ?"Send to review"
            :"Remove post"}
    </button>
    {message?<span className="muted" style={{fontSize:12}}>{message}</span>:null}
  </div>;
}
