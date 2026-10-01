"use client";

import {useEffect} from "react";

export default function ImageProtection(){
  useEffect(()=>{
    const isImageTarget=(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest("img"));
    const protectImages=(event:Event)=>{
      if(isImageTarget(event.target))event.preventDefault();
    };
    const protectImageContextMenu=(event:MouseEvent)=>{
      if(isImageTarget(event.target))event.preventDefault();
    };
    const blockUploadDrop=(event:Event)=>{
      if(event.target instanceof Element&&event.target.closest("[data-upload-surface]"))event.preventDefault();
    };

    document.addEventListener("dragstart",protectImages,true);
    document.addEventListener("contextmenu",protectImageContextMenu,true);
    document.addEventListener("drop",blockUploadDrop,true);
    document.addEventListener("dragover",blockUploadDrop,true);

    return()=>{
      document.removeEventListener("dragstart",protectImages,true);
      document.removeEventListener("contextmenu",protectImageContextMenu,true);
      document.removeEventListener("drop",blockUploadDrop,true);
      document.removeEventListener("dragover",blockUploadDrop,true);
    };
  },[]);

  return null;
}
