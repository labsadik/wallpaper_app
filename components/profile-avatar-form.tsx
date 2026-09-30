"use client";

import {ChangeEvent,useRef,useState} from "react";
import {useRouter} from "next/navigation";

export default function ProfileAvatarForm({name,avatarUrl}:{name:string;avatarUrl?:string|null}){
  const router=useRouter();
  const inputRef=useRef<HTMLInputElement>(null);
  const [preview,setPreview]=useState(avatarUrl||"");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  function choose(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function upload(){
    const file=inputRef.current?.files?.[0];
    if(!file)return;
    setBusy(true);setMessage("");
    try{
      const form=new FormData();
      form.set("file",file);
      const response=await fetch("/api/account/avatar",{method:"POST",body:form});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){setMessage(data.error||"Unable to update avatar.");return;}
      setMessage("Profile avatar updated.");
      router.refresh();
    }catch{
      setMessage("Network error. Try again.");
    }finally{setBusy(false);}
  }

  const initial=(name||"U").slice(0,1).toUpperCase();

  return <div className="profile-avatar-editor card">
    <div className="profile-avatar-preview">
      {preview
        ? <img className="protected-image" draggable={false} src={preview} alt="" />
        : <span>{initial}</span>}
    </div>
    <div className="profile-avatar-copy">
      <strong>Profile photo</strong>
      <span className="muted">Private Bunny storage key with short-lived signed delivery. JPG, PNG, WebP or AVIF, up to 5 MB.</span>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={choose}/>
      <div className="profile-avatar-actions">
        <button className="btn" type="button" onClick={()=>inputRef.current?.click()} disabled={busy}>Choose image</button>
        <button className="btn btn-primary" type="button" onClick={upload} disabled={busy||!inputRef.current?.files?.[0]}>
          {busy?"Uploading…":"Save avatar"}
        </button>
        {message?<span className="muted" role="status">{message}</span>:null}
      </div>
    </div>
  </div>;
}
