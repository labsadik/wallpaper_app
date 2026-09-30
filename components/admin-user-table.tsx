"use client";

import {useState} from "react";
import Link from "next/link";
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
  isVerified?:boolean;
  username?:string|null;
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
      setMessage("Account updated successfully.");
      router.refresh();
    }catch{
      setMessage("Network error. Try again.");
    }finally{
      setBusy(null);
    }
  }

  return <div style={{display:"grid",gap:12}}>
    {message?<div className="admin-action-message card" role="status">{message}</div>:null}
    {users.map(user=>{
      const id=String(user._id||user.id);
      const isSelf=id===currentAdminId;
      const verified=Boolean(user.isVerified);
      return <article className="card admin-user-card" key={id}>
        <div className="admin-user-heading">
          <div style={{minWidth:0}}>
            <div className="admin-user-name-row">
              <h2><Link href={"/admin/users/"+id}>{user.name}</Link></h2>
              {user.role==="publisher"
                ? <span className={verified?"admin-verification-status is-verified":"admin-verification-status"}>
                    <span className="admin-verification-dot"/>{verified?"Verified publisher":"Not verified"}
                  </span>
                : null}
            </div>
            <p className="muted admin-user-identity">{user.username?"@"+user.username+" · ":""}{user.email}</p>
            <div className="admin-user-badges">
              <span className="badge">{user.role}</span>
              <span className={user.status==="active"?"badge badge-selected":"badge"}>{user.status}</span>
              {user.suspensionUntil?<span className="badge">until {new Date(user.suspensionUntil).toLocaleString()}</span>:null}
            </div>
          </div>
          <span className="muted admin-user-joined">Joined {user.createdAt?new Date(user.createdAt).toLocaleDateString():"—"}</span>
        </div>

        <div className="admin-control-grid">
          <label className="admin-control-field">
            <span>Role</span>
            <select
              value={user.role}
              disabled={busy===id||isSelf}
              onChange={event=>act(id,{action:"role",role:event.target.value})}
              className="theme-select"
            >
              <option value="user">User</option>
              <option value="publisher">Publisher</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="admin-control-field">
            <span>Suspend for</span>
            <select
              defaultValue=""
              disabled={busy===id||isSelf||user.status==="banned"}
              onChange={event=>{
                const duration=event.target.value;
                if(duration)act(id,{action:"suspend",duration});
                event.currentTarget.value="";
              }}
              className="theme-select"
            >
              <option value="">Select duration…</option>
              {DURATIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          {user.role==="publisher"
            ? <div className={verified?"admin-verification-control is-verified":"admin-verification-control"}>
                <div>
                  <strong>Publisher verification</strong>
                  <span>{verified?"Verified and shown with a check badge.":"Not verified; public profile shows publisher status only."}</span>
                </div>
                <button
                  className={verified?"btn":"btn btn-primary"}
                  disabled={busy===id}
                  onClick={()=>act(id,{action:verified?"unverify":"verify"})}
                  type="button"
                >
                  {busy===id?"Saving…":verified?"Remove verification":"Verify publisher"}
                </button>
              </div>
            : <div className="admin-control-note">
                <strong>Verification</strong>
                <span>Verification is available after this account has the Publisher role.</span>
              </div>}

          <div className="admin-action-row">
            {user.status==="suspended"?<button className="btn" disabled={busy===id} onClick={()=>act(id,{action:"unsuspend"})}>{busy===id?"Saving…":"Unsuspend"}</button>:null}
            {user.status==="banned"
              ? <button className="btn" disabled={busy===id||isSelf} onClick={()=>act(id,{action:"unban"})}>{busy===id?"Saving…":"Unban"}</button>
              : <button className="btn" disabled={busy===id||isSelf} onClick={()=>act(id,{action:"ban",reason:"Administrative ban"})}>{busy===id?"Saving…":"Ban"}</button>}
          </div>
        </div>

        {(user.suspensionReason||user.banReason)?<p className="muted admin-user-reason">{user.suspensionReason||user.banReason}</p>:null}
      </article>;
    })}
  </div>;
}
