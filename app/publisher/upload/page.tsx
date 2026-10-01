"use client";

import {ChangeEvent,FormEvent,useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import PageShell from "@/components/page-shell";
import {Button,Field,Input,Select} from "@/components/ui";
import AutoPublishIndicator from "@/components/auto-publish-indicator";

const CATEGORIES=["Nature","Abstract","Animals","Anime","Architecture","Cars","City","Gaming","Minimal","Space","Technology","Travel","Other"];
const DEVICES=[
  {id:"desktop",label:"PC",icon:"▣",ratio:"16 / 9",description:"Desktop & laptop",preview:"aspect-video"},
  {id:"tablet",label:"Tablet",icon:"▤",ratio:"4 / 3",description:"Tablet screens",preview:"aspect-[4/3]"},
  {id:"mobile",label:"Mobile",icon:"▯",ratio:"9 / 16",description:"Phones",preview:"aspect-[9/16]"}
] as const;
type DeviceId=typeof DEVICES[number]["id"];

export default function PublisherUploadPage(){
  const [title,setTitle]=useState(""),[category,setCategory]=useState("Nature"),[file,setFile]=useState<File|null>(null),[previewUrl,setPreviewUrl]=useState("");
  const previewUrlRef=useRef(""),[devices,setDevices]=useState<DeviceId[]>(["desktop"]),[status,setStatus]=useState("");
  const [result,setResult]=useState<{id:string;slug:string;category:string;devices:DeviceId[];publishAt:string|null}|null>(null),[progress,setProgress]=useState(0),[progressLabel,setProgressLabel]=useState("");

  useEffect(()=>()=>{if(previewUrlRef.current)URL.revokeObjectURL(previewUrlRef.current);},[]);
  const sourceInfo=useMemo(()=>file?(file.size/1024/1024).toFixed(2)+" MB":null,[file]);

  function onFileChange(event:ChangeEvent<HTMLInputElement>){setResult(null);setStatus("");const next=event.target.files?.[0]||null;if(previewUrlRef.current)URL.revokeObjectURL(previewUrlRef.current);const nextUrl=next?URL.createObjectURL(next):"";previewUrlRef.current=nextUrl;setPreviewUrl(nextUrl);setFile(next);}
  function toggleDevice(device:DeviceId){setResult(null);setDevices([device]);}

  async function submit(event:FormEvent){
    event.preventDefault();if(!file){setStatus("Choose an image first.");return;}if(devices.length!==1){setStatus("Select exactly one target device.");return;}
    setStatus("Uploading…");setProgress(0);setProgressLabel("Uploading image");setResult(null);
    const formData=new FormData();formData.set("title",title);formData.set("category",category);formData.set("devices",devices.join(","));formData.set("file",file);
    try{
      const data=await new Promise<{wallpaperId:string;slug:string;category:string;devices:string[];publishAt?:string}>((resolve,reject)=>{
        const xhr=new XMLHttpRequest();xhr.open("POST","/api/publisher/upload",true);let processingTimer:ReturnType<typeof setInterval>|undefined;
        xhr.upload.onprogress=event=>{if(event.lengthComputable)setProgress(Math.min(75,Math.round(event.loaded/event.total*75)));};
        xhr.upload.onload=()=>{setProgress(76);setProgressLabel("Processing and optimizing");setStatus("Processing and optimizing…");processingTimer=setInterval(()=>setProgress(current=>Math.min(94,current+1)),450);};
        xhr.onload=()=>{if(processingTimer)clearInterval(processingTimer);let payload:{wallpaperId?:string;slug?:string;category?:string;devices?:string[];publishAt?:string;error?:string}={};try{payload=JSON.parse(xhr.responseText||"{}");}catch{}if(xhr.status>=200&&xhr.status<300&&payload.wallpaperId&&payload.slug){setProgress(100);setProgressLabel("Complete");resolve({wallpaperId:payload.wallpaperId,slug:payload.slug,category:payload.category||category,devices:Array.isArray(payload.devices)?payload.devices:[...devices],publishAt:payload.publishAt});}else reject(new Error(payload.error||"Upload failed."));};
        xhr.onerror=()=>{if(processingTimer)clearInterval(processingTimer);reject(new Error("Network error. Please try again."));};xhr.onabort=()=>{if(processingTimer)clearInterval(processingTimer);reject(new Error("Upload cancelled."));};xhr.send(formData);
      });
      setResult({id:String(data.wallpaperId),slug:String(data.slug),category:String(data.category||category),devices:data.devices as DeviceId[],publishAt:data.publishAt?new Date(data.publishAt).toISOString():null});setStatus("Upload submitted for review.");setProgressLabel("Complete");
      setTimeout(()=>{setProgress(0);setProgressLabel("");},1600);
    }catch(error){setStatus(error instanceof Error?error.message:"Upload failed.");setProgress(0);setProgressLabel("");}
  }

  return <PageShell eyebrow="Publisher Studio" title="Upload wallpaper" description="Choose an image, define its target screen, and let processing and optimization run automatically.">
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-start">
      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="group relative grid min-h-[280px] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-slate-400 hover:bg-slate-100">
          <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFileChange}/>
          {previewUrl?<div className="w-full"><div className="mx-auto aspect-video max-h-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><img className="protected-image block h-full w-full object-contain" draggable={false} onDragStart={event=>event.preventDefault()} src={previewUrl} alt="Selected wallpaper preview"/></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-left"><strong className="max-w-[75%] truncate text-sm font-black text-slate-900">{file?.name}</strong><span className="text-xs font-bold text-slate-500">{sourceInfo}</span></div></div>
            :<div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-2xl font-light text-slate-400 shadow-sm ring-1 ring-slate-200">＋</div><strong className="mt-4 block text-lg font-black text-slate-900">Choose wallpaper image</strong><p className="mt-1 text-sm leading-6 text-slate-500">JPG, PNG, WebP or AVIF · up to 25 MB · click to select</p></div>}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Misty Mountain Sunrise" required maxLength={160}/></Field>
          <Field label="Category"><Select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(item=><option key={item} value={item}>{item}</option>)}</Select></Field>
        </div>

        <section className="grid gap-3">
          <div><h2 className="text-sm font-black text-slate-900">Target device</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose exactly one. Create separate posts when you need another device version.</p></div>
          <div className="grid gap-2.5 sm:grid-cols-3">{DEVICES.map(device=>{const selected=devices.includes(device.id);return <button key={device.id} type="button" onClick={()=>toggleDevice(device.id)} aria-pressed={selected} className={selected?"rounded-2xl border border-slate-900 bg-slate-900 p-4 text-left text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400":"rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"}><div className="flex items-start justify-between gap-2"><span className="text-2xl leading-none">{device.icon}</span><span className={selected?"rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-900":"rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-500"}>{selected?"Selected":"Off"}</span></div><strong className="mt-4 block text-sm font-black">{device.label}</strong><span className={selected?"mt-1 block text-xs text-slate-300":"mt-1 block text-xs text-slate-500"}>{device.description} · {device.ratio}</span></button>})}</div>
        </section>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">✓</span><div><strong className="text-sm font-black text-slate-900">Automatic processing</strong><p className="mt-1 text-xs leading-5 text-slate-500">Format validation, quality checks, duplicate detection, optimization, selected-device output and pending-review workflow run automatically.</p></div></div></div>

        {progress>0?<div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"><div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600"><span>{progressLabel||"Working…"}</span><strong>{progress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-slate-900 transition-[width] duration-200" style={{width:progress+"%"}}/></div></div>:null}

        <div className="flex flex-wrap items-center gap-3"><Button variant="primary" type="submit" disabled={!file||progress>0}>{progress>0&&progress<100?"Processing…":"Upload and process"}</Button>{status?<span className="text-xs font-bold text-slate-500" role="status">{status}</span>:null}</div>

        {result?<div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-start justify-between gap-3"><div><strong className="text-sm font-black text-emerald-900">Upload saved successfully</strong><p className="mt-1 text-xs leading-5 text-emerald-700">The item is in review and will become public according to the publishing schedule.</p></div><span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">Pending review</span></div><div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">{result.category}</span><AutoPublishIndicator wallpaperId={result.id} status="pending_review" publishAt={result.publishAt}/>{DEVICES.filter(device=>result.devices.includes(device.id)).map(device=><span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-extrabold text-white" key={device.id}>{device.label}</span>)}</div><span className="mt-3 block break-all text-[11px] font-semibold text-emerald-700">ID: {result.id}</span><div className="mt-3 flex flex-wrap gap-2"><Link className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-extrabold text-emerald-800 hover:bg-emerald-50" href={"/wallpapers/"+result.slug}>Open private preview</Link><Link className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white hover:bg-slate-800" href="/publisher">Publisher studio</Link></div></div>:null}
      </section>

      <aside className="lg:sticky lg:top-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Preview</p><h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-slate-950">Device outputs</h2><p className="mt-1 text-xs leading-5 text-slate-500">See the selected source in each target frame.</p></div><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">1 / upload</span></div>
          <div className="mt-5 grid gap-3">{DEVICES.map(device=>{const selected=devices.includes(device.id);return <div key={device.id} className={selected?"rounded-2xl border border-slate-300 bg-slate-50 p-3":"rounded-2xl border border-slate-200 bg-white p-3 opacity-55"}><div className="mb-2 flex items-center justify-between gap-2"><strong className="text-sm font-black text-slate-900">{device.label}</strong><span className={selected?"rounded-full bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-white":"rounded-full border border-slate-200 px-2 py-1 text-[10px] font-extrabold text-slate-500"}>{selected?"Selected":"Not selected"}</span></div><div className={device.preview+" mx-auto max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white"}>{previewUrl?<img className="protected-image block h-full w-full object-contain" draggable={false} onDragStart={event=>event.preventDefault()} src={previewUrl} alt={device.label+" preview"}/>:<span className="grid h-full min-h-24 place-items-center text-xs font-semibold text-slate-400">Image preview</span>}</div></div>})}</div>
        </div>
      </aside>
    </form>
  </PageShell>;
}
