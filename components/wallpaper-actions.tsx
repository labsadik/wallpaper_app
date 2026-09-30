"use client";
import {useState} from "react";

export default function WallpaperActions({wallpaperId,initialLikes,initialSaved=false,shareUrl}:{wallpaperId:string;initialLikes:number;initialSaved?:boolean;shareUrl:string}){
  const [likes,setLikes]=useState(initialLikes); const [liked,setLiked]=useState(false); const [saved,setSaved]=useState(initialSaved); const [busy,setBusy]=useState(false);
  async function toggle(type:"like"|"save"){
    if(busy)return; setBusy(true);
    const r=await fetch("/api/wallpapers/"+wallpaperId+"/"+type,{method:"POST"});
    if(r.status===401){window.location.href="/login";return;}
    if(r.ok){const d=await r.json();if(type==="like"){setLiked(d.liked);setLikes(v=>Math.max(0,v+(d.liked?1:-1)));}else setSaved(d.saved);}
    setBusy(false);
  }
  async function share(){
    if(navigator.share){await navigator.share({title:"Wallpaper",url:shareUrl}).catch(()=>{});}
    else await navigator.clipboard?.writeText(shareUrl);
  }
  return <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
    <button className="btn" onClick={()=>toggle("like")} disabled={busy}>❤️ {likes}</button>
    <button className="btn" onClick={()=>toggle("save")} disabled={busy}>{saved?"🔖 Saved":"🔖 Save"}</button>
    <button className="btn" onClick={share}>↗ Share</button>
  </div>;
}