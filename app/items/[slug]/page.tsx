import {notFound} from "next/navigation";
import Image from "next/image";
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
import Link from "next/link";
import type {Metadata} from "next";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};
export const dynamic="force-dynamic";

async function findWallpaperForRequest(slug:string){const published=await Wallpaper.findOne({slug,status:"published"}).lean();if(published)return {wallpaper:published,privatePreview:false};const session=await getActiveSession();if(!session?.user?.id)return {wallpaper:null,privatePreview:false};const candidate=await Wallpaper.findOne({slug}).lean();if(!candidate)return {wallpaper:null,privatePreview:false};const isOwner=String(candidate.publisherId)===session.user.id,isAdmin=session.user.role==="admin";if(!isOwner&&!isAdmin)return {wallpaper:null,privatePreview:false};return {wallpaper:candidate,privatePreview:true};}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;await connectDB();await autoPublishDueWallpapers();const w=await Wallpaper.findOne({slug,status:"published"}).lean();if(!w)return {};const devices=w.devices?.length?w.devices:["desktop"],ogDevice=devices[0] as "desktop"|"tablet"|"mobile",ogVariant=w.variants?.[ogDevice]?.key,og=ogVariant?signedMediaUrl(ogVariant,86400):undefined,base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";return {title:w.title+" Wallpaper",description:"Download "+w.title+" wallpaper in high resolution. Available for "+(DEVICE_LABELS[ogDevice]||ogDevice)+".",alternates:{canonical:base+"/items/"+w.slug},keywords:[w.title,w.category,"wallpaper","HD wallpaper",DEVICE_LABELS[ogDevice]||ogDevice],openGraph:{type:"article",title:w.title+" Wallpaper",description:"High-resolution "+w.title+" wallpaper.",url:base+"/items/"+w.slug,publishedTime:w.publishedAt?new Date(w.publishedAt).toISOString():undefined,images:og?[{url:og}]:[]},twitter:{card:"summary_large_image",title:w.title+" Wallpaper",description:"High-resolution wallpaper.",images:og?[og]:[]}};}

export default async function ItemPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;await connectDB();await autoPublishDueWallpapers();const {wallpaper:w,privatePreview}=await findWallpaperForRequest(slug);if(!w)notFound();
  const [session,publisher]=await Promise.all([getActiveSession(),User.findById(w.publisherId).select("name username role isVerified avatarKey").lean()]);
  const canInteract=w.status==="published";
  const [liked,saved]=canInteract&&session?.user?.id?await Promise.all([Like.exists({userId:session.user.id,wallpaperId:w._id}),Save.exists({userId:session.user.id,wallpaperId:w._id})]):[false,false];
  const devices=w.devices?.length?w.devices:["desktop"];
  const variants={desktop:w.variants?.desktop?.key?{url:signedMediaUrl(w.variants.desktop.key),width:Math.max(16,w.variants.desktop.width||1600),height:Math.max(16,w.variants.desktop.height||900)}:null,tablet:w.variants?.tablet?.key?{url:signedMediaUrl(w.variants.tablet.key),width:Math.max(16,w.variants.tablet.width||1600),height:Math.max(16,w.variants.tablet.height||900)}:null,mobile:w.variants?.mobile?.key?{url:signedMediaUrl(w.variants.mobile.key),width:Math.max(16,w.variants.mobile.width||900),height:Math.max(16,w.variants.mobile.height||1600)}:null};
  const shareUrl=(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000")+"/items/"+w.slug,publisherAvatar=publisher?.avatarKey?signedMediaUrl(publisher.avatarKey):null;

  return <main className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
    {privatePreview?<div className="mb-4 flex flex-col gap-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"><strong>Private publisher preview</strong><span className="text-xs font-semibold text-amber-700">Currently {w.status==="pending_review"?"pending review":w.status.replace("_"," ")} · not visible in the public gallery.</span></div>:null}
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="p-2 sm:p-3"><WallpaperViewer title={w.title} devices={devices} variants={variants}/></div>
      <div className="border-t border-slate-200 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-1.5"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">{w.category}</span>{devices.map((device:string)=><span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-extrabold text-white" key={device}>{DEVICE_LABELS[device]||device}</span>)}<span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">{w.status}</span><span className={w.qualityStatus==="pass"?"rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700":"rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600"}>{w.qualityStatus}</span></div>
        <div className="mt-5 flex items-center gap-3"><div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-sm font-black text-white ring-2 ring-slate-100">{publisherAvatar?<Image className="protected-image size-11 object-cover" src={publisherAvatar} alt="Publisher avatar" width={44} height={44} unoptimized/>:<span>{(publisher?.name||"P").slice(0,1).toUpperCase()}</span>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><Link className="truncate text-sm font-black text-slate-900 hover:underline" href={publisher?.username?"/profile/"+publisher.username:"#"}>{publisher?.name||"Publisher"}</Link>{publisher?.role==="publisher"&&publisher?.isVerified?<VerifiedBadge/>:null}</div><span className="text-xs font-semibold text-slate-500">@{publisher?.username||"publisher"}</span></div></div>
        <h1 className="mt-5 text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">{w.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500"><span>♥ {w.likeCount||0} likes</span><span>🔖 {w.saveCount||0} saves</span><span>↓ {w.downloadCount||0} downloads</span><span>↗ {w.shareCount||0} shares</span><span>{w.source?.width||"—"}×{w.source?.height||"—"} source</span></div>
        <div className="mt-2"><PublishedAt value={w.publishedAt?new Date(w.publishedAt).toISOString():null}/></div>
        <div className="mt-5">{canInteract?<WallpaperActions wallpaperId={String(w._id)} initialLikes={w.likeCount||0} initialSaves={w.saveCount||0} initialDownloads={w.downloadCount||0} initialShares={w.shareCount||0} initialLiked={Boolean(liked)} initialSaved={Boolean(saved)} shareUrl={shareUrl} title={w.title} devices={devices} authenticated={Boolean(session)}/>:<p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold leading-6 text-slate-500">Like, save and download actions become available after this wallpaper is published.</p>}</div>
      </div>
    </div>
  </main>;
}
