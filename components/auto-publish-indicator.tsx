"use client";

import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";

export default function AutoPublishIndicator({wallpaperId,status,publishAt}:{wallpaperId:string;status:string;publishAt?:string|null}){
  const router=useRouter();
  const [currentStatus,setCurrentStatus]=useState(status);
  const [remaining,setRemaining]=useState<number|null>(null);
  const sent=useRef(false);

  useEffect(()=>{
    if(currentStatus!=="pending_review"||!publishAt)return;

    const publish=async()=>{
      if(sent.current)return;
      sent.current=true;
      try{
        const response=await fetch("/api/publisher/wallpapers/"+wallpaperId,{method:"POST"});
        const data=await response.json().catch(()=>({}));
        if(response.ok&&data.published){
          setCurrentStatus("published");
          setRemaining(0);
          router.refresh();
        }else{
          sent.current=false;
        }
      }catch{
        sent.current=false;
      }
    };

    const target=new Date(publishAt).getTime();
    const updateCountdown=()=>{
      const seconds=Math.max(0,Math.ceil((target-Date.now())/1000));
      setRemaining(seconds);
      if(seconds===0)void publish();
    };

    const firstTick=window.setTimeout(updateCountdown,0);
    const timer=window.setInterval(updateCountdown,1000);
    const publishTimer=window.setTimeout(()=>void publish(),Math.max(0,target-Date.now()));

    return ()=>{
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
      window.clearTimeout(publishTimer);
    };
  },[currentStatus,publishAt,wallpaperId,router]);

  if(currentStatus==="published")return <span className="badge badge-selected">Published</span>;
  if(currentStatus==="pending_review")return <span className="badge">{remaining===null?"Pending review":remaining===0?"Publishing…":"Auto-publish in "+remaining+"s"}</span>;
  return <span className="badge">{currentStatus}</span>;
}
