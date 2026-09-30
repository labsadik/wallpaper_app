import {notFound} from "next/navigation";
import Image from "next/image";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {bunnyPublicUrl} from "@/lib/bunny";
import WallpaperActions from "@/components/wallpaper-actions";
import type {Metadata} from "next";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; await connectDB();
  const w=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(!w)return {};
  const og=w.variants?.desktop?.key?bunnyPublicUrl(w.variants.desktop.key):undefined;
  return {title:w.title,description:"Download "+w.title+" wallpaper in high resolution.",openGraph:{title:w.title,description:"High-resolution wallpaper",images:og?[{url:og}]:[]}};
}

export default async function WallpaperPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; await connectDB();
  const w=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(!w)notFound();
  const image=w.variants?.desktop?.key?bunnyPublicUrl(w.variants.desktop.key):null;
  const width=w.variants?.desktop?.width||w.source?.width||1920;
  const height=w.variants?.desktop?.height||w.source?.height||1080;
  return <main className="container" style={{padding:"40px 0 80px"}}>
    <div className="card" style={{overflow:"hidden"}}>
      {image?<Image src={image} alt={w.title} width={width} height={height} sizes="(max-width: 1180px) 100vw, 1180px" priority style={{display:"block",width:"100%",height:"auto",maxHeight:"75vh",objectFit:"contain",background:"#05070b"}}/>:<div style={{aspectRatio:"16/9"}}/>}
      <div style={{padding:22}}>
        <h1 style={{fontSize:36,margin:"0 0 8px"}}>{w.title}</h1>
        <p className="muted">{w.category} · {w.source?.width}×{w.source?.height} · ❤️ {w.likeCount} · 🔖 {w.saveCount} · ⬇ {w.downloadCount}</p>
        <div style={{marginTop:14}}>
          <WallpaperActions wallpaperId={String(w._id)} initialLikes={w.likeCount} shareUrl={(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000")+"/wallpaper/"+w.slug}/>
        </div>
      </div>
    </div>
  </main>;
}