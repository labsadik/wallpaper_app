import {notFound} from "next/navigation";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import Like from "@/models/Like";
import Save from "@/models/Save";
import {bunnyPublicUrl} from "@/lib/bunny";
import WallpaperActions from "@/components/wallpaper-actions";
import WallpaperViewer from "@/components/wallpaper-viewer";
import type {Metadata} from "next";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  await connectDB();
  const w=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(!w)return {};
  const devices=w.devices?.length?w.devices:["desktop","tablet","mobile"];
  const ogDevice=devices.includes("desktop")?"desktop":devices[0];
  const ogVariant=w.variants?.[ogDevice as "desktop"|"tablet"|"mobile"]?.key;
  const og=ogVariant?bunnyPublicUrl(ogVariant):undefined;
  return {
    title:w.title,
    description:"Download "+w.title+" wallpaper in high resolution.",
    openGraph:{title:w.title,description:"High-resolution wallpaper",images:og?[{url:og}]:[]}
  };
}

export default async function WallpaperPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  await connectDB();

  const w=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(!w)notFound();

  const session=await getServerSession(authOptions);
  const [liked,saved]=session?.user?.id
    ? await Promise.all([
        Like.exists({userId:session.user.id,wallpaperId:w._id}),
        Save.exists({userId:session.user.id,wallpaperId:w._id})
      ])
    : [false,false];

  const devices=w.devices?.length?w.devices:["desktop","tablet","mobile"];
  const variants={
    desktop:w.variants?.desktop?.key?bunnyPublicUrl(w.variants.desktop.key):null,
    tablet:w.variants?.tablet?.key?bunnyPublicUrl(w.variants.tablet.key):null,
    mobile:w.variants?.mobile?.key?bunnyPublicUrl(w.variants.mobile.key):null
  };
  const shareUrl=(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000")+"/wallpapers/"+w.slug;

  return <main className="container" style={{padding:"40px 0 80px"}}>
    <div className="card" style={{padding:14}}>
      <WallpaperViewer title={w.title} devices={devices} variants={variants}/>
      <div style={{padding:"8px 8px 10px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
          <span className="badge">{w.category}</span>
          {devices.map((device:string)=><span className="badge badge-selected" key={device}>{DEVICE_LABELS[device]||device}</span>)}
          <span className={w.qualityStatus==="pass"?"badge badge-selected":"badge"}>{w.qualityStatus}</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,42px)",lineHeight:1.05,margin:"0 0 8px",overflowWrap:"anywhere"}}>{w.title}</h1>
        <p className="muted">{w.source?.width}×{w.source?.height} source · ❤️ {w.likeCount} · 🔖 {w.saveCount} · ⬇ {w.downloadCount}</p>
        <div style={{marginTop:14}}>
          <WallpaperActions
            wallpaperId={String(w._id)}
            initialLikes={w.likeCount}
            initialLiked={Boolean(liked)}
            initialSaved={Boolean(saved)}
            shareUrl={shareUrl}
            title={w.title}
            devices={devices}
          />
        </div>
      </div>
    </div>
  </main>;
}
