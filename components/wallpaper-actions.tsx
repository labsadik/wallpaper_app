"use client";
import {useState} from "react";

export default function WallpaperActions({
  wallpaperId,
  initialLikes,
  initialLiked=false,
  initialSaved=false,
  shareUrl
}:{
  wallpaperId:string;
  initialLikes:number;
  initialLiked?:boolean;
  initialSaved?:boolean;
  shareUrl:string
}){
  const [likes,setLikes]=useState(initialLikes);
  const [liked,setLiked]=useState(initialLiked);
  const [saved,setSaved]=useState(initialSaved);
  const [busy,setBusy]=useState(false);
  const [downloadBusy,setDownloadBusy]=useState(false);

  async function toggle(type:"like"|"save"){
    if(busy)return;
    setBusy(true);
    try{
      const r=await fetch("/api/wallpapers/"+wallpaperId+"/"+type,{method:"POST"});
      if(r.status===401){
        window.location.href="/login?callbackUrl="+encodeURIComponent(window.location.pathname);
        return;
      }
      const d=await r.json().catch(()=>({}));
      if(!r.ok) return;
      if(type==="like"){
        setLiked(Boolean(d.liked));
        setLikes(v=>Math.max(0,v+(d.liked?1:-1)));
      }else{
        setSaved(Boolean(d.saved));
      }
    }finally{
      setBusy(false);
    }
  }

  async function download(){
    if(downloadBusy)return;
    setDownloadBusy(true);
    try{
      const r=await fetch("/api/wallpapers/"+wallpaperId+"/download");
      const d=await r.json().catch(()=>({}));
      if(!r.ok){
        if(r.status===401){
          window.location.href="/login?callbackUrl="+encodeURIComponent(window.location.pathname);
        }
        return;
      }
      if(d.url) window.location.assign(d.url);
    }finally{
      setDownloadBusy(false);
    }
  }

  async function share(){
    if(navigator.share){
      await navigator.share({title:"Wallpaper",url:shareUrl}).catch(()=>{});
      return;
    }
    if(navigator.clipboard){
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied.");
    }
  }

  return <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
    <button className="btn" onClick={()=>toggle("like")} disabled={busy}>{liked?"❤️":"♡"} {likes}</button>
    <button className="btn" onClick={()=>toggle("save")} disabled={busy}>{saved?"🔖 Saved":"🔖 Save"}</button>
    <button className="btn" onClick={share}>↗ Share</button>
    <button className="btn btn-primary" onClick={download} disabled={downloadBusy}>{downloadBusy?"Preparing...":"⬇ Download"}</button>
  </div>;
}
