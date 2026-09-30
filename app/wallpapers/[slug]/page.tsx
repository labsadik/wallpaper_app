import {notFound} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import {getActiveSession} from "@/lib/admin";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";
import Like from "@/models/Like";
import Save from "@/models/Save";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import WallpaperActions from "@/components/wallpaper-actions";
import WallpaperViewer from "@/components/wallpaper-viewer";
import PublishedAt from "@/components/published-at";
import VerifiedBadge from "@/components/verified-badge";
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
  await autoPublishDueWallpapers();

  const w=await Wallpaper.findOne({slug,status:"published"}).lean();
  if(!w)return {};

  const devices=w.devices?.length?w.devices:["desktop"];
  const ogDevice=devices[0] as "desktop"|"tablet"|"mobile";
  const ogVariant=w.variants?.[ogDevice]?.key;
  const og=ogVariant?signedMediaUrl(ogVariant,86400):undefined;
  const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";

  return {
    title:w.title+" Wallpaper",
    description:"Download "+w.title+" wallpaper in high resolution. Available for "+(DEVICE_LABELS[ogDevice]||ogDevice)+".",
    alternates:{canonical:base+"/wallpapers/"+w.slug},
    keywords:[w.title,w.category,"wallpaper","HD wallpaper",DEVICE_LABELS[ogDevice]||ogDevice],
    openGraph:{
      type:"article",
      title:w.title+" Wallpaper",
      description:"High-resolution "+w.title+" wallpaper.",
      url:base+"/wallpapers/"+w.slug,
      publishedTime:w.publishedAt?new Date(w.publishedAt).toISOString():undefined,
      images:og?[{url:og}]:[]
    },
    twitter:{
      card:"summary_large_image",
      title:w.title+" Wallpaper",
      description:"High-resolution wallpaper.",
      images:og?[og]:[]
    }
  };
}

export default async function WallpaperPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  await connectDB();
  await autoPublishDueWallpapers();

  const {wallpaper:w,privatePreview}=await findWallpaperForRequest(slug);
  if(!w)notFound();

  const [session,publisher]=await Promise.all([
    getActiveSession(),
    User.findById(w.publisherId).select("name username role isVerified avatarKey").lean()
  ]);

  const canInteract=w.status==="published";
  const [liked,saved]=canInteract&&session?.user?.id
    ? await Promise.all([
        Like.exists({userId:session.user.id,wallpaperId:w._id}),
        Save.exists({userId:session.user.id,wallpaperId:w._id})
      ])
    : [false,false];

  const devices=w.devices?.length?w.devices:["desktop"];
  const variants={
    desktop:w.variants?.desktop?.key?signedMediaUrl(w.variants.desktop.key):null,
    tablet:w.variants?.tablet?.key?signedMediaUrl(w.variants.tablet.key):null,
    mobile:w.variants?.mobile?.key?signedMediaUrl(w.variants.mobile.key):null
  };
  const shareUrl=(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000")+"/wallpapers/"+w.slug;
  const publisherAvatar=publisher?.avatarKey?signedMediaUrl(publisher.avatarKey):null;

  return <main className="container wallpaper-detail-page">
    {privatePreview?<div className="card private-preview-banner">
      <strong>Private publisher preview</strong>
      <span className="muted">This wallpaper is currently {w.status==="pending_review"?"pending review":w.status.replace("_"," ")} and is not visible in the public gallery.</span>
    </div>:null}

    <div className="card wallpaper-detail-card">
      <WallpaperViewer title={w.title} devices={devices} variants={variants}/>

      <div className="wallpaper-detail-body">
        <div className="wallpaper-meta-row">
          <span className="badge">{w.category}</span>
          {devices.map((device:string)=><span className="badge badge-selected" key={device}>{DEVICE_LABELS[device]||device}</span>)}
          <span className="badge">{w.status}</span>
          <span className={w.qualityStatus==="pass"?"badge badge-selected":"badge"}>{w.qualityStatus}</span>
        </div>

        <div className="publisher-identity">
          <div className="publisher-avatar">
            {publisherAvatar?<img className="protected-image" draggable={false} src={publisherAvatar} alt="Publisher avatar"/>:<span>{(publisher?.name||"P").slice(0,1).toUpperCase()}</span>}
          </div>
          <div>
            <div className="publisher-name-row">
              <strong>{publisher?.name||"Publisher"}</strong>
              {publisher?.role==="publisher"&&publisher?.isVerified?<VerifiedBadge/>:null}
            </div>
            <span className="muted">@{publisher?.username||"publisher"}</span>
          </div>
        </div>

        <h1>{w.title}</h1>
        <p className="muted">{w.source?.width}×{w.source?.height} source · ❤️ {w.likeCount} · 🔖 {w.saveCount} · ⬇ {w.downloadCount}</p>
        <PublishedAt value={w.publishedAt?new Date(w.publishedAt).toISOString():null}/>

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
                authenticated={Boolean(session)}
              />
            </div>
          : <p className="muted" style={{margin:"14px 0 0",fontSize:13}}>Like, save and download actions become available after this wallpaper is published.</p>}
      </div>
    </div>
  </main>;
}
