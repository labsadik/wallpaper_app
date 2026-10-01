"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

export default function ProfileStats({username,followers:initialFollowers,following:initialFollowing,wallpapers}:{username:string;followers:number;following:number;wallpapers:number}){
  const [followers,setFollowers]=useState(initialFollowers),[following,setFollowing]=useState(initialFollowing);
  useEffect(()=>{const onChange=(event:Event)=>{const detail=(event as CustomEvent<{username:string;followers:number;followingCount:number}>).detail;if(detail?.username?.toLowerCase()!==username.toLowerCase())return;setFollowers(Number(detail.followers)||0);setFollowing(Number(detail.followingCount)||0);};window.addEventListener("profile-follow-counts",onChange);return()=>window.removeEventListener("profile-follow-counts",onChange);},[username]);
  const items=[["Followers",followers,"/profile/"+username+"/followers"],["Following",following,"/profile/"+username+"/following"],["Wallpapers",wallpapers,null]] as const;
  return <div className="mt-4 flex flex-wrap gap-2">{items.map(([label,value,href])=>href?<Link href={href} className="group min-w-[105px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:-translate-y-px hover:border-slate-300 hover:bg-white hover:shadow-sm" key={label}><strong className="block text-lg font-black leading-tight text-slate-950">{value}</strong><span className="mt-0.5 block text-[11px] font-extrabold text-slate-500 group-hover:text-slate-700">{label}</span></Link>:<span className="min-w-[105px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" key={label}><strong className="block text-lg font-black leading-tight text-slate-950">{value}</strong><span className="mt-0.5 block text-[11px] font-extrabold text-slate-500">{label}</span></span>)}</div>;
}
