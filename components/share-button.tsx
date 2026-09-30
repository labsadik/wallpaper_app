"use client";

import {useState} from "react";

export default function ShareButton({title,href}:{title:string;href:string}){
  const [status,setStatus]=useState("");
  async function share(){
    const url=new URL(href,window.location.origin).toString();
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
