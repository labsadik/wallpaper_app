"use client";

import {useMemo,useState} from "react";

const LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export default function WallpaperViewer({title,devices,variants}:{title:string;devices:string[];variants:Record<string,string|null>}){
  const available=devices.length?devices:["desktop","tablet","mobile"];
  const [device,setDevice]=useState(available[0]);
  const image=useMemo(()=>variants[device]||variants[available[0]]||null,[device,variants,available]);
  return <section style={{display:"grid",gap:12}}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {available.map(item=><button key={item} type="button" className={device===item?"btn btn-primary":"btn"} onClick={()=>setDevice(item)} aria-pressed={device===item}>
        {LABELS[item]||item}
      </button>)}
    </div>
    <div className="card" style={{overflow:"hidden",background:"#05070b"}}>
      {image?<img src={image} alt={title+" - "+(LABELS[device]||device)} style={{display:"block",width:"100%",height:"auto",maxHeight:"75vh",objectFit:"contain"}}/>:<div style={{aspectRatio:"16/9",display:"grid",placeItems:"center"}}><span className="muted">Image unavailable for this device.</span></div>}
    </div>
  </section>;
}
