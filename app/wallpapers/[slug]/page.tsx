import {notFound} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {bunnyPublicUrl} from "@/lib/bunny";
import WallpaperActions from "@/components/wallpaper-actions";
import type {Metadata} from "next";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; await connectDB(); const w=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(!w)return {};
  return {title:w.title,description:"Download "+w.title+" wallpaper in high resolution.",openGraph:{title:w.title,description:"High-resolution wallpaper",images:w.variants?.desktop?.key?[{url:bunnyPublicUrl(w.variants.desktop.key)}]:[]}};
}

export default async function WallpaperPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; await connectDB(); const w=await Wallpaper.findOne({slug,status:"published"}).lean(); if(!w)notFound();
  const image=w.variants?.desktop?.key?bunnyPublicUrl(w.variants.desktop.key):null;
  return <main className="container" style={{padding:"40px 0 80px"}}>
    <div className="card" style={{overflow:"hidden"}}>
      {image?<img src={image} alt={w.title} style={{display:"block",width:"100%",height:"auto",maxHeight:"75vh",objectFit:"contain",background:"#05070b"}}/>:<div style={{aspectRatio:"16/9"}}/>}
      <div style={{padding:22}}><h1 style={{fontSize:36,margin:"0 0 8px"}}>{w.title}</h1><p className="muted">{w.category} · {w.source?.width}×{w.source?.height}</p><WallpaperActions wallpaperId={String(w._id)} initialLikes={w.likeCount} shareUrl={process.env.NEXT_PUBLIC_APP_URL+"/wallpaper/"+w.slug}/></div>
    </div>
  </main>;
}