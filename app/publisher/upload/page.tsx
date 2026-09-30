/* eslint-disable @next/next/no-img-element */
"use client";

import {ChangeEvent,FormEvent,useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import PageShell from "@/components/page-shell";
import {Button,Field,Input} from "@/components/ui";
import AutoPublishIndicator from "@/components/auto-publish-indicator";

const CATEGORIES=[
  "Nature","Abstract","Animals","Anime","Architecture","Cars","City",
  "Gaming","Minimal","Space","Technology","Travel","Other"
];

const DEVICES=[
  {id:"desktop",label:"PC",icon:"▣",ratio:"16 / 9",description:"Desktop & laptop"},
  {id:"tablet",label:"Tablet",icon:"▤",ratio:"4 / 3",description:"Tablet screens"},
  {id:"mobile",label:"Mobile",icon:"▯",ratio:"9 / 16",description:"Phones"}
] as const;

type DeviceId=typeof DEVICES[number]["id"];

export default function PublisherUploadPage(){
  const [title,setTitle]=useState("");
  const [category,setCategory]=useState("Nature");
  const [file,setFile]=useState<File|null>(null);
  const [previewUrl,setPreviewUrl]=useState("");
  const previewUrlRef=useRef("");
  const [devices,setDevices]=useState<DeviceId[]>(["desktop","tablet","mobile"]);
  const [status,setStatus]=useState("");
  const [result,setResult]=useState<{id:string;slug:string;category:string;devices:DeviceId[];publishAt:string|null}|null>(null);
  const [progress,setProgress]=useState(0);
  const [progressLabel,setProgressLabel]=useState("");

  useEffect(()=>{
    return ()=>{
      if(previewUrlRef.current)URL.revokeObjectURL(previewUrlRef.current);
    };
  },[]);

  const sourceInfo=useMemo(()=>{
    if(!file)return null;
    return (file.size/1024/1024).toFixed(2)+" MB";
  },[file]);

  function onFileChange(event:ChangeEvent<HTMLInputElement>){
    setResult(null);
    setStatus("");
    const next=event.target.files?.[0]||null;
    if(previewUrlRef.current)URL.revokeObjectURL(previewUrlRef.current);
    const nextUrl=next?URL.createObjectURL(next):"";
    previewUrlRef.current=nextUrl;
    setPreviewUrl(nextUrl);
    setFile(next);
  }

  function toggleDevice(device:DeviceId){
    setResult(null);
    setDevices(current=>{
      if(current.includes(device)){
        return current.length===1?current:current.filter(item=>item!==device);
      }
      return [...current,device];
    });
  }

  async function submit(event:FormEvent){
    event.preventDefault();
    if(!file){
      setStatus("Choose an image first.");
      return;
    }
    if(devices.length===0){
      setStatus("Select at least one target device.");
      return;
    }

    setStatus("Uploading…");
    setProgress(0);
    setProgressLabel("Uploading image");
    setResult(null);

    const formData=new FormData();
    formData.set("title",title);
    formData.set("category",category);
    formData.set("devices",devices.join(","));
    formData.set("file",file);

    try{
      const data=await new Promise<{wallpaperId:string;slug:string;category:string;devices:string[]}>((resolve,reject)=>{
        const xhr=new XMLHttpRequest();
        xhr.open("POST","/api/publisher/upload",true);

        let processingTimer:ReturnType<typeof setInterval>|undefined;
        xhr.upload.onprogress=event=>{
          if(event.lengthComputable){
            setProgress(Math.min(75,Math.round((event.loaded/event.total)*75)));
          }
        };
        xhr.upload.onload=()=>{
          setProgress(76);
          setProgressLabel("Processing and optimizing");
          setStatus("Processing and optimizing…");
          processingTimer=setInterval(()=>{
            setProgress(current=>Math.min(94,current+1));
          },450);
        };
        xhr.onload=()=>{
          if(processingTimer)clearInterval(processingTimer);
          let payload:{wallpaperId?:string;slug?:string;category?:string;devices?:string[];error?:string}={};
          try{payload=JSON.parse(xhr.responseText||"{}");}catch{}
          if(xhr.status>=200&&xhr.status<300&&payload.wallpaperId&&payload.slug){
            setProgress(100);
            setProgressLabel("Complete");
            resolve({
              wallpaperId:payload.wallpaperId,
              slug:payload.slug,
              category:payload.category||category,
              devices:Array.isArray(payload.devices)?payload.devices:[...devices]
            });
          }else{
            reject(new Error(payload.error||"Upload failed."));
          }
        };
        xhr.onerror=()=>{if(processingTimer)clearInterval(processingTimer);reject(new Error("Network error. Please try again."));};
        xhr.onabort=()=>{if(processingTimer)clearInterval(processingTimer);reject(new Error("Upload cancelled."));};
        xhr.send(formData);
      });

      setResult({
        id:String(data.wallpaperId),
        slug:String(data.slug),
        category:String(data.category||category),
        devices:data.devices as DeviceId[],
        publishAt:data.publishAt?new Date(data.publishAt).toISOString():null
      });
      setStatus("Upload submitted for review.");
      setProgressLabel("Complete");
      setTimeout(()=>{
        setProgress(0);
        setProgressLabel("");
      },1600);
    }catch(error){
      setStatus(error instanceof Error?error.message:"Upload failed.");
      setProgress(0);
      setProgressLabel("");
    }
  }

  return <PageShell
    eyebrow="Publisher Studio"
    title="Upload wallpaper"
    description="Preview your image, choose a category and select the target devices. New uploads are saved as Pending review."
  >
    <form onSubmit={submit} className="upload-layout">
      <section className="card" style={{padding:24,display:"grid",gap:20}}>
        <label className="card" style={{minHeight:250,borderStyle:"dashed",display:"grid",placeItems:"center",padding:24,cursor:"pointer",background:"#0d1118",overflow:"hidden",position:"relative"}}>
          <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFileChange}/>
          {previewUrl
            ? <div style={{width:"100%"}}>
                <div style={{aspectRatio:"16/9",borderRadius:14,overflow:"hidden",background:"#06090f"}}>
                  <img src={previewUrl} alt="Selected wallpaper preview" style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:12,flexWrap:"wrap"}}>
                  <strong style={{fontSize:15,overflow:"hidden",textOverflow:"ellipsis"}}>{file?.name}</strong>
                  <span className="muted">{sourceInfo}</span>
                </div>
              </div>
            : <div style={{textAlign:"center"}}>
                <div style={{fontSize:42,marginBottom:10}}>＋</div>
                <strong style={{fontSize:20}}>Choose wallpaper image</strong>
                <p className="muted" style={{margin:"8px 0 0"}}>JPG, PNG, WebP or AVIF · up to 25 MB</p>
              </div>
          }
        </label>

        <div style={{display:"grid",gap:10}}>
          <Field label="Title">
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Misty Mountain Sunrise" required maxLength={160}/>
          </Field>

          <Field label="Category">
            <select
              value={category}
              onChange={e=>setCategory(e.target.value)}
              style={{padding:"12px 13px",borderRadius:12,border:"1px solid var(--line)",background:"#0d1118",color:"white",outline:"none",width:"100%"}}
            >
              {CATEGORIES.map(item=><option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
        </div>

        <div style={{display:"grid",gap:12}}>
          <div>
            <strong style={{fontSize:16}}>Target devices</strong>
            <p className="muted" style={{fontSize:13,margin:"4px 0 0"}}>Select where this wallpaper should be available.</p>
          </div>
          <div className="device-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
            {DEVICES.map(device=>{
              const selected=devices.includes(device.id);
              return <button
                key={device.id}
                type="button"
                onClick={()=>toggleDevice(device.id)}
                aria-pressed={selected}
                className="card"
                style={{
                  padding:14,
                  textAlign:"left",
                  cursor:"pointer",
                  borderColor:selected?"#ffffff":"var(--line)",
                  background:selected?"#1b202a":"#0d1118",
                  boxShadow:selected?"0 0 0 1px #ffffff inset":"none"
                }}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <span style={{fontSize:28,lineHeight:1}}>{device.icon}</span>
                  <span style={{fontSize:12,fontWeight:800,padding:"4px 7px",borderRadius:999,background:selected?"white":"#171c25",color:selected?"#0b0d12":"var(--muted)"}}>
                    {selected?"Selected":"Off"}
                  </span>
                </div>
                <strong style={{display:"block",marginTop:10}}>{device.label}</strong>
                <span className="muted" style={{display:"block",fontSize:12,marginTop:3}}>{device.description} · {device.ratio}</span>
              </button>;
            })}
          </div>
        </div>

        <div className="card" style={{padding:16,display:"grid",gap:9}}>
          <strong>Automatic checks</strong>
          <span className="muted">✓ Format and integrity · ✓ Any resolution accepted · ✓ Quality warning for smaller sources · ✓ Duplicate detection · ✓ Optimization · ✓ Selected device targets saved · ✓ Pending review workflow</span>
        </div>

        {progress>0?<div className="card" style={{padding:13,display:"grid",gap:7}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:13}}>
            <span>{progressLabel||"Working…"}</span>
            <strong>{progress}%</strong>
          </div>
          <div style={{height:8,borderRadius:999,background:"#202633",overflow:"hidden"}}>
            <div style={{height:"100%",width:progress+"%",background:"#fff",transition:"width .25s ease"}}/>
          </div>
        </div>:null}

        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <Button variant="primary" type="submit" disabled={!file||progress>0}>{progress>0&&progress<100?"Processing…":"Upload and process"}</Button>
          {status?<span className="muted">{status}</span>:null}
        </div>

        {result?<div className="card" style={{padding:16,display:"grid",gap:10,borderColor:"#3a4352"}}>
          <strong>Saved upload · Pending review</strong>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span className="badge">{result.category}</span>
            <span className="badge">pending_review</span>
            {DEVICES.filter(device=>result.devices.includes(device.id)).map(device=><span className="badge" key={device.id}>{device.label}</span>)}
          </div>
          <span className="muted" style={{fontSize:13}}>Wallpaper ID: {result.id}</span>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Link className="btn" href={"/wallpapers/"+result.slug}>Open private preview</Link>
            <Link className="btn" href="/publisher">Back to publisher studio</Link>
          </div>
        </div>:null}
      </section>

      <aside className="sticky-preview" style={{display:"grid",gap:14,position:"sticky",top:20}}>
        <div className="card" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div>
              <strong>Device preview</strong>
              <p className="muted" style={{margin:"4px 0 0",fontSize:13}}>Three previews make the selected targets clear before upload.</p>
            </div>
            <span className="badge">{devices.length}/3</span>
          </div>
          <div style={{display:"grid",gap:12,marginTop:16}}>
            {DEVICES.map(device=>{
              const selected=devices.includes(device.id);
              return <div key={device.id} className="card" style={{padding:10,opacity:selected?1:.45}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <strong>{device.label}</strong>
                  <span className={selected?"badge badge-selected":"badge"}>{selected?"Selected":"Not selected"}</span>
                </div>
                <div style={{
                  aspectRatio:device.id==="desktop"?"16 / 9":device.id==="tablet"?"4 / 3":"9 / 16",
                  maxHeight:device.id==="mobile"?220:140,
                  margin:"0 auto",
                  borderRadius:10,
                  overflow:"hidden",
                  background:"#06090f",
                  border:"1px solid var(--line)",
                  display:"grid",
                  placeItems:"center"
                }}>
                  {previewUrl
                    ? <img src={previewUrl} alt={device.label+" preview"} style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}/>
                    : <span className="muted" style={{fontSize:12}}>Image preview</span>
                  }
                </div>
              </div>;
            })}
          </div>
        </div>
      </aside>
    </form>
  </PageShell>;
}
