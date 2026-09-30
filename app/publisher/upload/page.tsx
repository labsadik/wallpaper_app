"use client";
import {FormEvent,useState} from "react";
import PageShell from "@/components/page-shell";
import {Button,Field,Input} from "@/components/ui";

export default function PublisherUploadPage(){
  const [title,setTitle]=useState(""); const [category,setCategory]=useState("Nature"); const [file,setFile]=useState<File|null>(null); const [status,setStatus]=useState("");
  async function submit(e:FormEvent){e.preventDefault();if(!file){setStatus("Choose an image first.");return;}setStatus("Processing...");
    const fd=new FormData();fd.set("title",title);fd.set("category",category);fd.set("file",file);
    const r=await fetch("/api/publisher/upload",{method:"POST",body:fd});const d=await r.json();setStatus(r.ok?"Submitted for review. Your wallpaper is being prepared.":(d.error||"Upload failed"));
  }
  return <PageShell eyebrow="Publisher Studio" title="Upload wallpaper" description="Upload one source image. Any supported resolution is accepted; lower-resolution sources receive a quality warning. Duplicate detection, optimization and device variants are automatic.">
    <form onSubmit={submit} className="card" style={{padding:24,maxWidth:860,display:"grid",gap:20}}>
      <label className="card" style={{minHeight:250,borderStyle:"dashed",display:"grid",placeItems:"center",padding:28,cursor:"pointer",background:"#0d1118"}}>
        <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>setFile(e.target.files?.[0]||null)}/>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:42,marginBottom:10}}>＋</div>
          <strong style={{fontSize:20}}>{file?file.name:"Drop your wallpaper here"}</strong>
          <p className="muted" style={{margin:"8px 0 0"}}>JPG, PNG, WebP or AVIF · up to 25 MB</p>
        </div>
      </label>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
        <Field label="Title"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Misty Mountain Sunrise" required/></Field>
        <Field label="Category"><Input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Nature"/></Field>
      </div>
      <div className="card" style={{padding:16,display:"grid",gap:9}}>
        <strong>Automatic checks</strong>
        <span className="muted">✓ Format and integrity · ✓ Any resolution accepted · ✓ Quality warning for smaller sources · ✓ Duplicate detection · ✓ Desktop/tablet/mobile variants · ✓ File optimization</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <Button variant="primary" type="submit">Upload and process</Button>
        {status?<span className="muted">{status}</span>:null}
      </div>
    </form>
  </PageShell>;
}