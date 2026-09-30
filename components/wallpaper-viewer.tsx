"use client";

import Image from "next/image";
import {useState} from "react";

const LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

type Variant={url:string;width:number;height:number};

export default function WallpaperViewer({
  title,
  devices,
  variants
}:{
  title:string;
  devices:string[];
  variants:Record<string,Variant|null>;
}){
  const available=devices.length?devices:["desktop"];
  const [device,setDevice]=useState(available[0]);
  const image=variants[device]||variants[available[0]]||null;

  return <section className="wallpaper-viewer" style={{display:"grid",gap:12}}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}} aria-label="Wallpaper device versions">
      {available.map(item=><button
        key={item}
        type="button"
        className={device===item?"btn btn-primary":"btn"}
        onClick={()=>setDevice(item)}
        aria-pressed={device===item}
      >
        {LABELS[item]||item}
      </button>)}
    </div>

    <div className="card wallpaper-viewer-surface">
      {image
        ? <Image
            className="protected-image"
            draggable={false}
            onDragStart={event=>event.preventDefault()}
            src={image.url}
            alt={title+" - "+(LABELS[device]||device)}
            width={image.width}
            height={image.height}
            sizes="(max-width: 900px) 100vw, 900px"
            unoptimized
            style={{display:"block",width:"100%",height:"auto",maxHeight:"75vh",objectFit:"contain"}}
          />
        : <div style={{aspectRatio:"16/9",display:"grid",placeItems:"center"}}>
            <span className="muted">Image unavailable for this device.</span>
          </div>}
    </div>
  </section>;
}
