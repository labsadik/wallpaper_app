"use client";

import {useEffect,useState} from "react";

export default function ProfileFollowButton({username,initialFollowing=false,isSelf=false,authenticated=false}:{username:string;initialFollowing?:boolean;isSelf?:boolean;authenticated?:boolean}){
  const [following,setFollowing]=useState(initialFollowing);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    if(!authenticated||isSelf)return;
    fetch("/api/profile/"+encodeURIComponent(username)+"/follow",{cache:"no-store"})
      .then(response=>response.ok?response.json():null)
      .then(data=>{
        if(data){
          setFollowing(Boolean(data.following));
        }
      })
      .catch(()=>{});
  },[username,authenticated,isSelf]);

  if(isSelf)return <a className="btn" href="/account">Edit profile</a>;
  if(!authenticated)return <a className="btn btn-primary" href="/login">Follow</a>;

  async function toggle(){
    setBusy(true);
    setMessage("");
    try{
      const response=await fetch("/api/profile/"+encodeURIComponent(username)+"/follow",{method:"POST"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        setMessage(data.error||"Could not update follow status.");
        return;
      }
      setFollowing(Boolean(data.following));
      window.dispatchEvent(new CustomEvent("profile-follow-counts",{detail:{username,followers:data.followers,followingCount:data.followingCount}}));
    }catch{
      setMessage("Network error. Please try again.");
    }finally{
      setBusy(false);
    }
  }

  return <div className="profile-follow-control">
    <button type="button" className={following?"btn":"btn btn-primary"} onClick={toggle} disabled={busy}>
      {busy?"Saving…":following?"Following":"Follow"}
    </button>
    {message?<span className="profile-follow-error" role="status">{message}</span>:null}
  </div>;
}
