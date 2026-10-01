"use client";

import {useMemo} from "react";

export default function PublishedAt({value}:{value?:string|Date|null}){
  const iso=useMemo(()=>{if(!value)return "";const date=value instanceof Date?value:new Date(value);return Number.isNaN(date.getTime())?"":date.toISOString();},[value]);
  const label=useMemo(()=>{if(!iso)return "Publication time unavailable";return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(iso));},[iso]);
  if(!iso)return <span className="text-xs font-semibold text-slate-400">Publication time unavailable</span>;
  return <time dateTime={iso} title={new Date(iso).toISOString()} className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning>Published · {label}</time>;
}
