import {notFound} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import {getActiveSession} from "@/lib/admin";
import Wallpaper from "@/models/Wallpaper";
import Like from "@/models/Like";
import Save from "@/models/Save";
import {bunnyPublicUrl} from "@/lib/bunny";
import WallpaperActions from "@/components/wallpaper-actions";
import WallpaperViewer from "@/components/wallpaper-viewer";
import type {Metadata} from "next";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export const dynamic="force-dynamic";

async function findWallpaperForRequest(slug:string){
  const published=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(published)return {wallpaper:published,privatePreview:false};

  const session=await getActiveSession();
  if(!session?.user?.id)return {wallpaper:null,privatePreview:false};

  const candidate=await Wallpaper.findOne({slug}).lean();
  if(!candidate)return {wallpaper:null,privatePreview:false};

  const isOwner=String(candidate.publisherId)===session.user.id;
  const isAdmin=session.user.role==="admin";
  if(!isOwner&&!isAdmin)return {wallpaper:null,privatePreview:false};

  return {wallpaper:candidate,privatePreview:true};
}

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

  const {wallpaper:w,privatePreview}=await findWallpaperForRequest(slug);
  if(!w)notFound();

  const session=await getActiveSession();
  const canInteract=w.status==="published";
  const [liked,saved]=canInteract&&session?.user?.id
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
    {privatePreview?<div className="card" style={{padding:"12px 14px",marginBottom:14,borderColor:"#3a4352"}}>
      <strong>Private publisher preview</strong>
      <span className="muted" style={{display:"block",marginTop:4,fontSize:13}}>
        This wallpaper is currently {w.status==="pending_review"?"pending review":w.status.replace("_"," ")} and is not visible in the public gallery.
      </span>
    </div>:null}

    <div className="card" style={{padding:14}}>
      <WallpaperViewer title={w.title} devices={devices} variants={variants}/>
      <div style={{padding:"8px 8px 10px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
          <span className="badge">{w.category}</span>
          {devices.map((device:string)=><span className="badge badge-selected" key={device}>{DEVICE_LABELS[device]||device}</span>)}
          <span className="badge">{w.status}</span>
          <span className={w.qualityStatus==="pass"?"badge badge-selected":"badge"}>{w.qualityStatus}</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,42px)",lineHeight:1.05,margin:"0 0 8px",overflowWrap:"anywhere"}}>{w.title}</h1>
        <p className="muted">{w.source?.width}×{w.source?.height} source · ❤️ {w.likeCount} · 🔖 {w.saveCount} · ⬇ {w.downloadCount}</p>
        {canInteract
          ? <div style={{marginTop:14}}>
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
          : <p className="muted" style={{margin:"14px 0 0",fontSize:13}}>Like, save and download actions become available after this wallpaper is published.</p>}
      </div>
    </div>
  </main>;
}
