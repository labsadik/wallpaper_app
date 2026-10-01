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

  return (
    <section className="grid gap-3" aria-label="Wallpaper preview">
      <div className="flex flex-wrap gap-2" aria-label="Wallpaper device versions">
        {available.map(item=>(
          <button
            key={item}
            type="button"
            className={device===item
              ?"inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              :"inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"}
            onClick={()=>setDevice(item)}
            aria-pressed={device===item}
          >
            {LABELS[item]||item}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
        {image
          ? <Image
              className="protected-image mx-auto block h-auto max-h-[75vh] w-full object-contain"
             
              onDragStart={event=>event.preventDefault()}
              src={image.url}
              alt={title+" - "+(LABELS[device]||device)}
              width={image.width}
              height={image.height}
              sizes="(max-width: 900px) 100vw, 900px"
              unoptimized
            />
          : <div className="grid min-h-[360px] place-items-center bg-slate-100 p-8 text-center">
              <span className="text-sm font-semibold text-slate-500">Image unavailable for this device.</span>
            </div>}
      </div>
    </section>
  );
}
