"use client";

import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";

export default function AutoPublishIndicator({wallpaperId,status,publishAt}:{wallpaperId:string;status:string;publishAt?:string|null}){
  const router=useRouter(),[currentStatus,setCurrentStatus]=useState(status),[remaining,setRemaining]=useState<number|null>(null),sent=useRef(false);
  useEffect(()=>{if(currentStatus!=="pending_review"||!publishAt)return;const publish=async()=>{if(sent.current)return;sent.current=true;try{const response=await fetch("/api/publisher/wallpapers/"+wallpaperId,{method:"POST"});const data=await response.json().catch(()=>({}));if(response.ok&&data.published){setCurrentStatus("published");setRemaining(0);router.refresh();}else sent.current=false;}catch{sent.current=false;}};const target=new Date(publishAt).getTime();const updateCountdown=()=>{const seconds=Math.max(0,Math.ceil((target-Date.now())/1000));setRemaining(seconds);if(seconds===0)void publish();};const firstTick=window.setTimeout(updateCountdown,0),timer=window.setInterval(updateCountdown,1000),publishTimer=window.setTimeout(()=>void publish(),Math.max(0,target-Date.now()));return()=>{window.clearTimeout(firstTick);window.clearInterval(timer);window.clearTimeout(publishTimer);};},[currentStatus,publishAt,wallpaperId,router]);
  if(currentStatus==="published")return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500"/>Published</span>;
  if(currentStatus==="pending_review")return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700"><span className="size-1.5 rounded-full bg-amber-500"/>{remaining===null?"Pending review":remaining===0?"Publishing…":"Auto-publish in "+remaining+"s"}</span>;
  return <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">{currentStatus}</span>;
}