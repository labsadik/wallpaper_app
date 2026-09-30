"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

type AdminUser={
  _id?:string;
  id?:string;
  name:string;
  email:string;
  role:"user"|"publisher"|"admin";
  status:"active"|"suspended"|"banned";
  suspensionUntil?:string|Date|null;
  suspensionReason?:string|null;
  banReason?:string|null;
  createdAt?:string|Date;
};

const DURATIONS=[
  ["1h","1 hour"],
  ["24h","24 hours"],
  ["7d","7 days"],
  ["30d","30 days"],
  ["permanent","Permanent"]
] as const;

export default function AdminUserTable({users:initialUsers,currentAdminId}:{users:AdminUser[];currentAdminId:string}){
  const router=useRouter();
  const [users,setUsers]=useState(initialUsers);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function act(userId:string,body:Record<string,string>){
    setBusy(userId);
    setMessage("");
    try{
      const response=await fetch("/api/admin/users/"+userId,{
        method:"PATCH",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(body)
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        setMessage(data.error||"Action failed.");
        return;
      }
      setUsers(current=>current.map(user=>(String(user._id||user.id)===userId?{...user,...data.user}:user)));
      setMessage("User updated successfully.");
      router.refresh();
    }catch{
      setMessage("Network error. Try again.");
    }finally{
      setBusy(null);
    }
  }

  return <div style={{display:"grid",gap:12}}>
    {message?<div className="card" role="status" style={{padding:12}}>{message}</div>:null}
    {users.map(user=>{
      const id=String(user._id||user.id);
      const isSelf=id===currentAdminId;
      return <article className="card" key={id} style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
          <div style={{minWidth:0}}>
            <h2 style={{fontSize:19,margin:0,overflowWrap:"anywhere"}}>{user.name}</h2>
            <p className="muted" style={{margin:"4px 0 0",overflowWrap:"anywhere"}}>{user.email}</p>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:10}}>
              <span className="badge">{user.role}</span>
              <span className={user.status==="active"?"badge badge-selected":"badge"}>{user.status}</span>
              {user.suspensionUntil?<span className="badge">until {new Date(user.suspensionUntil).toLocaleString()}</span>:null}
            </div>
          </div>
          <span className="muted" style={{fontSize:12}}>Joined {user.createdAt?new Date(user.createdAt).toLocaleDateString():"—"}</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginTop:16}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{fontSize:12,fontWeight:700}}>Role</span>
            <select
              value={user.role}
              disabled={busy===id||isSelf}
              onChange={event=>act(id,{action:"role",role:event.target.value})}
              style={{padding:"10px 11px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}
            >
              <option value="user">User</option>
              <option value="publisher">Publisher</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label style={{display:"grid",gap:6}}>
            <span style={{fontSize:12,fontWeight:700}}>Suspend for</span>
            <select
              defaultValue=""
              disabled={busy===id||isSelf||user.status==="banned"}
              onChange={event=>{
                const duration=event.target.value;
                if(duration)act(id,{action:"suspend",duration});
                event.currentTarget.value="";
              }}
              style={{padding:"10px 11px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}
            >
              <option value="">Select duration…</option>
              {DURATIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <div style={{display:"flex",alignItems:"end",gap:8,flexWrap:"wrap"}}>
            {user.status==="suspended"?<button className="btn" disabled={busy===id} onClick={()=>act(id,{action:"unsuspend"})}>{busy===id?"Saving…":"Unsuspend"}</button>:null}
            {user.status==="banned"
              ? <button className="btn" disabled={busy===id||isSelf} onClick={()=>act(id,{action:"unban"})}>{busy===id?"Saving…":"Unban"}</button>
              : <button className="btn" disabled={busy===id||isSelf} onClick={()=>act(id,{action:"ban",reason:"Administrative ban"})}>{busy===id?"Saving…":"Ban"}</button>}
          </div>
        </div>

        {(user.suspensionReason||user.banReason)?<p className="muted" style={{margin:"12px 0 0",fontSize:12}}>{user.suspensionReason||user.banReason}</p>:null}
      </article>;
    })}
  </div>;
}
