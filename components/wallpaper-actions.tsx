"use client";

import {useMemo,useState} from "react";
import {useRouter} from "next/navigation";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export default function WallpaperActions({
  wallpaperId,
  initialLikes,
  initialLiked=false,
  initialSaved=false,
  shareUrl,
  title,
  devices=[]
}:{
  wallpaperId:string;
  initialLikes:number;
  initialLiked?:boolean;
  initialSaved?:boolean;
  shareUrl:string;
  title?:string;
  devices?:string[];
}){
  const router=useRouter();
  const [likes,setLikes]=useState(initialLikes);
  const [liked,setLiked]=useState(initialLiked);
  const [saved,setSaved]=useState(initialSaved);
  const [busy,setBusy]=useState(false);
  const [downloadBusy,setDownloadBusy]=useState(false);
  const [downloadProgress,setDownloadProgress]=useState(0);
  const [downloadStatus,setDownloadStatus]=useState("");
  const availableDevices=useMemo(()=>devices.length?devices:["desktop","tablet","mobile"],[devices]);
  const [downloadDevice,setDownloadDevice]=useState(availableDevices[0]||"desktop");

  async function toggle(type:"like"|"save"){
    if(busy)return;
    setBusy(true);
    try{
      const r=await fetch("/api/wallpapers/"+wallpaperId+"/"+type,{method:"POST"});
      if(r.status===401){
        router.push("/login?callbackUrl="+encodeURIComponent(window.location.pathname));
        return;
      }
      const d=await r.json().catch(()=>({}));
      if(!r.ok)return;
      if(type==="like"){
        setLiked(Boolean(d.liked));
        setLikes(v=>Math.max(0,v+(d.liked?1:-1)));
      }else setSaved(Boolean(d.saved));
    }finally{
      setBusy(false);
    }
  }

  async function download(){
    if(downloadBusy)return;
    setDownloadBusy(true);
    setDownloadProgress(4);
    setDownloadStatus("Preparing download…");
    try{
      const r=await fetch("/api/wallpapers/"+wallpaperId+"/download?device="+encodeURIComponent(downloadDevice));
      const d=await r.json().catch(()=>({}));
      if(!r.ok){
        if(r.status===401)router.push("/login?callbackUrl="+encodeURIComponent(window.location.pathname));
        setDownloadStatus(d.error||"Download failed.");
        return;
      }
      if(!d.url){
        setDownloadStatus("Download URL unavailable.");
        return;
      }

      setDownloadProgress(8);
      setDownloadStatus("Downloading…");

      await new Promise<void>((resolve,reject)=>{
        const xhr=new XMLHttpRequest();
        xhr.open("GET",d.url,true);
        xhr.responseType="blob";
        xhr.onprogress=event=>{
          if(event.lengthComputable){
            setDownloadProgress(Math.min(96,8+Math.round((event.loaded/event.total)*88)));
          }else{
            setDownloadProgress(v=>Math.min(92,v+4));
          }
        };
        xhr.onload=()=>{
          if(xhr.status>=200&&xhr.status<300){
            setDownloadProgress(100);
            const blobUrl=URL.createObjectURL(xhr.response);
            const anchor=document.createElement("a");
            anchor.href=blobUrl;
            anchor.download=String(d.filename||((title||"wallpaper").trim().replace(/[^a-z0-9]+/gi,"-").toLowerCase())+".webp");
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(blobUrl);
            setDownloadStatus("Download ready.");
            resolve();
          }else reject(new Error("Download request failed"));
        };
        xhr.onerror=()=>reject(new Error("Cross-origin download unavailable"));
        xhr.onabort=()=>reject(new Error("Download cancelled"));
        xhr.send();
      }).catch(()=>{
        // Bunny CDN may not expose CORS for blob downloads. Preserve working direct download.
        setDownloadProgress(100);
        setDownloadStatus("Opening download…");
        window.location.assign(d.url);
      });
    }catch{
      setDownloadStatus("Unable to download right now.");
    }finally{
      setTimeout(()=>{
        setDownloadBusy(false);
        setDownloadProgress(0);
        setDownloadStatus("");
      },1200);
    }
  }

  async function share(){
    if(navigator.share){
      await navigator.share({title:title||"Wallpaper",url:shareUrl}).catch(()=>{});
      return;
    }
    if(navigator.clipboard){
      await navigator.clipboard.writeText(shareUrl);
      setDownloadStatus("Link copied.");
      setTimeout(()=>setDownloadStatus(""),1400);
    }
  }

  return <div style={{display:"grid",gap:12}}>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <button className="btn" onClick={()=>toggle("like")} disabled={busy}>{liked?"❤️":"♡"} {likes}</button>
      <button className="btn" onClick={()=>toggle("save")} disabled={busy}>{saved?"🔖 Saved":"🔖 Save"}</button>
      <button className="btn" onClick={share}>↗ Share</button>

      <select
        value={downloadDevice}
        onChange={event=>setDownloadDevice(event.target.value)}
        disabled={downloadBusy}
        aria-label="Download device"
        style={{padding:"10px 12px",borderRadius:12,border:"1px solid var(--line)",background:"#171c25",color:"white"}}
      >
        {availableDevices.map(device=><option value={device} key={device}>Download {DEVICE_LABELS[device]||device}</option>)}
      </select>

      <button className="btn btn-primary" onClick={download} disabled={downloadBusy}>
        {downloadBusy?"Downloading…":"⬇ Download"}
      </button>
    </div>

    {downloadBusy||downloadStatus?<div className="card" style={{padding:12,display:"grid",gap:7}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:13}}>
        <span>{downloadStatus||"Preparing…"}</span>
        <strong>{downloadProgress}%</strong>
      </div>
      <div style={{height:7,borderRadius:999,background:"#202633",overflow:"hidden"}}>
        <div style={{height:"100%",width:downloadProgress+"%",background:"#fff",transition:"width .2s ease"}}/>
      </div>
    </div>:null}
  </div>;
}
