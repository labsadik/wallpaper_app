"use client";

import {useEffect} from "react";

export default function ImageProtection(){
  useEffect(()=>{
    const isImageTarget=(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest("img"));
    const protectImages=(event:Event)=>{if(isImageTarget(event.target))event.preventDefault();};
    const protectImageContextMenu=(event:MouseEvent)=>{if(isImageTarget(event.target))event.preventDefault();};
    const blockUploadDrop=(event:Event)=>{if(event.target instanceof Element&&event.target.closest("[data-upload-surface]"))event.preventDefault();};
    const syncImages=()=>document.querySelectorAll("img").forEach(image=>{image.draggable=false;});
    document.addEventListener("dragstart",protectImages,true);document.addEventListener("contextmenu",protectImageContextMenu,true);document.addEventListener("drop",blockUploadDrop,true);document.addEventListener("dragover",blockUploadDrop,true);syncImages();
    const observer=new MutationObserver(syncImages);if(document.body)observer.observe(document.body,{subtree:true,childList:true});
    return()=>{document.removeEventListener("dragstart",protectImages,true);document.removeEventListener("contextmenu",protectImageContextMenu,true);document.removeEventListener("drop",blockUploadDrop,true);document.removeEventListener("dragover",blockUploadDrop,true);observer.disconnect();};
  },[]);
  return null;
}
