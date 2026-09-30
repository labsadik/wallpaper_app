"use client";

import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";

export default function AutoPublishIndicator({wallpaperId,status,publishAt}:{wallpaperId:string;status:string;publishAt?:string|null}){
  const router=useRouter();
  const [currentStatus,setCurrentStatus]=useState(status);
  const [remaining,setRemaining]=useState<number|null>(()=>{
    if(!publishAt||status!=="pending_review")return null;
    return Math.max(0,Math.ceil((new Date(publishAt).getTime()-Date.now())/1000));
  });
  const sent=useRef(false);

  useEffect(()=>{
    if(currentStatus!=="pending_review"||!publishAt)return;
    let timer:ReturnType<typeof setInterval>|undefined;
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
        }else sent.current=false;
      }catch{sent.current=false;}
    };

    const tick=()=>{
      const seconds=Math.max(0,Math.ceil((new Date(publishAt).getTime()-Date.now())/1000));
      setRemaining(seconds);
      if(seconds===0)void publish();
    };
    tick();
    timer=setInterval(tick,1000);
    return ()=>{if(timer)clearInterval(timer);};
  },[currentStatus,publishAt,wallpaperId,router]);

  if(currentStatus==="published")return <span className="badge badge-selected">Published</span>;
  if(currentStatus==="pending_review")return <span className="badge">{remaining===null?"Pending review":"Auto-publish in "+remaining+"s"}</span>;
  return <span className="badge">{currentStatus}</span>;
}
