"use client";

import Image from "next/image";
import {ChangeEvent,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui";

export default function ProfileAvatarForm({name,avatarUrl}:{name:string;avatarUrl?:string|null}){
  const router=useRouter(),inputRef=useRef<HTMLInputElement>(null);
  const [preview,setPreview]=useState(avatarUrl||""),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  function choose(event:ChangeEvent<HTMLInputElement>){const selected=event.target.files?.[0]||null;if(!selected)return;setFile(selected);setPreview(URL.createObjectURL(selected));setMessage("");}
  async function upload(){if(!file)return;setBusy(true);setMessage("");try{const form=new FormData();form.set("file",file);const response=await fetch("/api/account/avatar",{method:"POST",body:form});const data=await response.json().catch(()=>({}));if(!response.ok){setMessage(data.error||"Unable to update avatar.");return;}setMessage("Profile avatar updated.");setFile(null);if(inputRef.current)inputRef.current.value="";router.refresh();}catch{setMessage("Network error. Try again.");}finally{setBusy(false);}}
  const initial=(name||"U").slice(0,1).toUpperCase();
  return <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-xl font-black text-white ring-4 ring-slate-100">{preview?<Image className="protected-image size-16 object-cover" draggable={false} src={preview} alt="" width={64} height={64} unoptimized/>:<span>{initial}</span>}</div><div className="min-w-[240px] flex-1"><strong className="text-sm font-black text-slate-900">Profile photo</strong><p className="mt-1 text-xs leading-5 text-slate-500">Private Bunny storage with short-lived signed delivery. JPG, PNG, WebP or AVIF, up to 5 MB.</p><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={choose}/><div className="mt-3 flex flex-wrap items-center gap-2"><Button type="button" onClick={()=>inputRef.current?.click()} disabled={busy}>Choose image</Button><Button type="button" variant="primary" onClick={upload} disabled={busy||!file}>{busy?"Uploading…":"Save avatar"}</Button>{message?<span className="text-xs font-bold text-slate-500" role="status">{message}</span>:null}</div></div></section>;
}