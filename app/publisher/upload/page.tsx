"use client";
import {FormEvent,useState} from "react";

export default function PublisherUploadPage(){
  const [title,setTitle]=useState(""); const [category,setCategory]=useState("Nature"); const [file,setFile]=useState<File|null>(null); const [status,setStatus]=useState("");
  async function submit(e:FormEvent){e.preventDefault();if(!file)return setStatus("Choose an image first.");setStatus("Processing...");
    const fd=new FormData();fd.set("title",title);fd.set("category",category);fd.set("file",file);
    const r=await fetch("/api/publisher/upload",{method:"POST",body:fd});const d=await r.json();setStatus(r.ok?"Submitted for review. ID: "+d.wallpaperId:(d.error||"Upload failed"));
  }
  return <main className="container" style={{padding:"48px 0 80px"}}><div className="card" style={{maxWidth:700,padding:28}}>
    <h1 style={{fontSize:36}}>Upload wallpaper</h1><p className="muted">Upload one source image. Validation, optimization, device variants and duplicate checks run automatically.</p>
    <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Wallpaper title" style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>setFile(e.target.files?.[0]||null)} required/>
      <button className="btn btn-primary" type="submit">Upload and process</button>
      {status&&<p className="muted">{status}</p>}
    </form>
  </div></main>;
}