"use client";

import {useEffect,useMemo,useState} from "react";

export default function PublishedAt({value}:{value?:string|Date|null}){
  const iso=useMemo(()=>{
    if(!value)return "";
    const date=value instanceof Date?value:new Date(value);
    return Number.isNaN(date.getTime())?"":date.toISOString();
  },[value]);

  const fallback=useMemo(()=>{
    if(!iso)return "Publication time unavailable";
    return new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"}).format(new Date(iso))+" UTC";
  },[iso]);

  const [label,setLabel]=useState(fallback);

  useEffect(()=>{
    if(!iso)return;
    setLabel(new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(iso)));
  },[iso]);

  if(!iso)return <span className="muted">Publication time unavailable</span>;

  return <time dateTime={iso} title={new Date(iso).toISOString()} className="published-at">
    Published · {label}
  </time>;
}
