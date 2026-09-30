"use client";

import {useMemo,useState} from "react";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export default function WallpaperActions({
  wallpaperId,
  initialLikes,
  initialSaves=0,
  initialDownloads=0,
  initialShares=0,
  initialLiked=false,
  initialSaved=false,
  shareUrl,
  title,
  devices=[],
  authenticated=true
}:{
  wallpaperId:string;
  initialLikes:number;
  initialSaves?:number;
  initialDownloads?:number;
  initialShares?:number;
  initialLiked?:boolean;
  initialSaved?:boolean;
  shareUrl:string;
  title?:string;
  devices?:string[];
  authenticated?:boolean;
}){
  const [likes,setLikes]=useState(initialLikes);
  const [saves,setSaves]=useState(initialSaves);
  const [downloads,setDownloads]=useState(initialDownloads);
  const [shares,setShares]=useState(initialShares);
  const [liked,setLiked]=useState(initialLiked);
  const [saved,setSaved]=useState(initialSaved);
  const [busy,setBusy]=useState(false);
  const [downloadBusy,setDownloadBusy]=useState(false);
  const [shareBusy,setShareBusy]=useState(false);
  const [downloadProgress,setDownloadProgress]=useState(0);
  const [downloadStatus,setDownloadStatus]=useState("");
  const availableDevices=useMemo(()=>devices.length?devices:["desktop","tablet","mobile"],[devices]);
  const [downloadDevice,setDownloadDevice]=useState(availableDevices[0]||"desktop");

  async function toggle(type:"like"|"save"){
    if(busy)return;
    setBusy(true);
    try{
      const r=await fetch("/api/wallpapers/"+wallpaperId+"/"+type,{method:"POST"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){
        setDownloadStatus(d.error||"Unable to update.");
        return;
      }
      if(type==="like"){
        setLiked(Boolean(d.liked));
        setLikes(v=>Math.max(0,v+(d.liked?1:-1)));
      }else{
        setSaved(Boolean(d.saved));
        setSaves(v=>Math.max(0,v+(d.saved?1:-1)));
      }
    }catch{
      setDownloadStatus("Network error. Try again.");
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
      const blob=await new Promise<{blob:Blob;filename:string}>((resolve,reject)=>{
        const xhr=new XMLHttpRequest();
        xhr.open("GET","/api/wallpapers/"+wallpaperId+"/download?device="+encodeURIComponent(downloadDevice),true);
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
            const disposition=xhr.getResponseHeader("content-disposition")||"";
            const match=disposition.match(/filename="?([^"]+)"?/i);
            resolve({
              blob:xhr.response,
              filename:match?.[1]||((title||"wallpaper").trim().replace(/[^a-z0-9]+/gi,"-").toLowerCase())+".webp"
            });
          }else if(xhr.status===401){
            reject(new Error("LOGIN_REQUIRED"));
          }else{
            reject(new Error("Download request failed"));
          }
        };
        xhr.onerror=()=>reject(new Error("Download request failed"));
        xhr.onabort=()=>reject(new Error("Download cancelled"));
        xhr.send();
      });

      const blobUrl=URL.createObjectURL(blob.blob);
      const anchor=document.createElement("a");
      anchor.href=blobUrl;
      anchor.download=blob.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
      setDownloads(v=>v+1);
      setDownloadStatus("Download ready.");
    }catch(error){
      setDownloadStatus(error instanceof Error&&error.message==="LOGIN_REQUIRED"
        ?"Login required to download."
        :"Unable to download right now.");
    }finally{
      setTimeout(()=>{
        setDownloadBusy(false);
        setDownloadProgress(0);
        setDownloadStatus("");
      },1200);
    }
  }

  async function share(){
    if(shareBusy)return;
    setShareBusy(true);
    try{
      const url=new URL(shareUrl,window.location.origin).toString();
      let shared=false;
      if(navigator.share){
        try{
          await navigator.share({title:title||"Wallpaper",url});
          shared=true;
        }catch(error){
          if(error instanceof DOMException&&error.name==="AbortError")return;
        }
      }else if(navigator.clipboard){
        await navigator.clipboard.writeText(url);
        setDownloadStatus("Link copied.");
        shared=true;
        setTimeout(()=>setDownloadStatus(""),1400);
      }

      if(shared){
        const response=await fetch("/api/wallpapers/"+wallpaperId+"/share",{method:"POST"});
        const data=await response.json().catch(()=>({}));
        if(response.ok)setShares(Number(data.shareCount)||shares+1);
      }
    }catch{
      setDownloadStatus("Unable to share right now.");
    }finally{
      setShareBusy(false);
    }
  }

  return <div style={{display:"grid",gap:12}}>
    <div className="wallpaper-action-bar">
      {authenticated?<>
        <button className="btn" onClick={()=>toggle("like")} disabled={busy}>{liked?"❤️":"♡"} {likes}</button>
        <button className="btn" onClick={()=>toggle("save")} disabled={busy}>{saved?"🔖":"🔖"} {saves}</button>
        <select
          value={downloadDevice}
          onChange={event=>setDownloadDevice(event.target.value)}
          disabled={downloadBusy}
          aria-label="Download device"
          className="theme-select"
        >
          {availableDevices.map(device=><option value={device} key={device}>Download {DEVICE_LABELS[device]||device}</option>)}
        </select>
        <button className="btn btn-primary" onClick={download} disabled={downloadBusy}>
          {downloadBusy?"Downloading…":"⬇ Download"} {downloads}
        </button>
      </>:null}
      <button className="btn" onClick={share} disabled={shareBusy}>↗ Share {shares}</button>
    </div>

    {!authenticated?<span className="muted" style={{fontSize:12}}>Browsing and sharing work without login. Like, save and download require an active account.</span>:null}

    {downloadBusy||downloadStatus?<div className="card" style={{padding:12,display:"grid",gap:7}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:13}}>
        <span>{downloadStatus||"Preparing…"}</span>
        <strong>{downloadProgress}%</strong>
      </div>
      <div style={{height:7,borderRadius:999,background:"#e2e8f0",overflow:"hidden"}}>
        <div style={{height:"100%",width:downloadProgress+"%",background:"#111827",transition:"width .2s ease"}}/>
      </div>
    </div>:null}
  </div>;
}
