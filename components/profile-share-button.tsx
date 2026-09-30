"use client";

import {useState} from "react";

export default function ProfileShareButton({username,name}:{username:string;name:string}){
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  async function share(){
    if(busy)return;
    setBusy(true);
    try{
      const url=new URL("/profile/"+username,window.location.origin).toString();
      if(navigator.share){
        await navigator.share({title:name+" · Wallpaper profile",text:"View "+name+"'s Wallpaper profile.",url});
        setStatus("Shared");
      }else if(navigator.clipboard){
        await navigator.clipboard.writeText(url);
        setStatus("Link copied");
        setTimeout(()=>setStatus(""),1600);
      }
    }catch(error){
      if(!(error instanceof DOMException&&error.name==="AbortError"))setStatus("Unable to share");
    }finally{
      setBusy(false);
    }
  }

  return <button type="button" className="btn" onClick={share} disabled={busy}>
    {busy?"Sharing…":status||"↗ Share profile"}
  </button>;
}
