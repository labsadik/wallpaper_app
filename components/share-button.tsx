"use client";

import {useState} from "react";

export default function ShareButton({title,url}:{title:string;url:string}){
  const [status,setStatus]=useState("");
  async function share(){
    if(navigator.share){
      await navigator.share({title,url}).catch(()=>{});
      return;
    }
    if(navigator.clipboard){
      await navigator.clipboard.writeText(url);
      setStatus("Copied");
      setTimeout(()=>setStatus(""),1400);
    }
  }
  return <button className="btn" onClick={share} aria-label={"Share "+title}>{status||"↗ Share"}</button>;
}
