"use client";

import {useEffect} from "react";

export default function ImageProtection(){
  useEffect(()=>{
    const protectImages=(event:Event)=>{
      const target=event.target;
      if(target instanceof Element && target.closest("img")){
        event.preventDefault();
      }
    };

    const blockUploadDrop=(event:Event)=>{
      const target=event.target;
      if(target instanceof Element && target.closest(".image-upload-surface")){
        event.preventDefault();
      }
    };

    const syncImages=()=>{
      document.querySelectorAll("img").forEach(image=>{
        image.draggable=false;
      });
    };

    document.addEventListener("dragstart",protectImages,true);
    document.addEventListener("drop",blockUploadDrop,true);
    document.addEventListener("dragover",blockUploadDrop,true);
    syncImages();

    const observer=new MutationObserver(syncImages);
    if(document.body)observer.observe(document.body,{subtree:true,childList:true});

    return ()=>{
      document.removeEventListener("dragstart",protectImages,true);
      document.removeEventListener("drop",blockUploadDrop,true);
      document.removeEventListener("dragover",blockUploadDrop,true);
      observer.disconnect();
    };
  },[]);

  return null;
}
