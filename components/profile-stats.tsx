"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

export default function ProfileStats({username,followers:initialFollowers,following:initialFollowing,wallpapers}:{username:string;followers:number;following:number;wallpapers:number}){
  const [followers,setFollowers]=useState(initialFollowers);
  const [following,setFollowing]=useState(initialFollowing);

  useEffect(()=>{
    const onChange=(event:Event)=>{
      const detail=(event as CustomEvent<{username:string;followers:number;followingCount:number}>).detail;
      if(detail?.username?.toLowerCase()!==username.toLowerCase())return;
      setFollowers(Number(detail.followers)||0);
      setFollowing(Number(detail.followingCount)||0);
    };
    window.addEventListener("profile-follow-counts",onChange);
    return ()=>window.removeEventListener("profile-follow-counts",onChange);
  },[username]);

  return <div className="public-profile-stats">
    <Link href={"/profile/"+username+"/followers"} className="public-profile-stat">
      <strong>{followers}</strong><span>Followers</span>
    </Link>
    <Link href={"/profile/"+username+"/following"} className="public-profile-stat">
      <strong>{following}</strong><span>Following</span>
    </Link>
    <span className="public-profile-stat"><strong>{wallpapers}</strong><span>Wallpapers</span></span>
  </div>;
}
