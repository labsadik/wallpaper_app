import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import Follow from "@/models/Follow";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import {signedMediaUrl} from "@/lib/media";
import WallpaperCard from "@/components/wallpaper-card";
import VerifiedBadge from "@/components/verified-badge";
import ProfileFollowButton from "@/components/profile-follow-button";
import ProfileStats from "@/components/profile-stats";
import ProfileShareButton from "@/components/profile-share-button";

export const dynamic="force-dynamic";
type Props={params:Promise<{username:string}>};
async function getProfile(username:string){await connectDB();return User.findOne({username:username.toLowerCase(),status:"active"}).select("name username role isVerified avatarKey createdAt").lean();}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {username}=await params;const user=await getProfile(username);if(!user)return {};const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000",canonical=base+"/profile/"+user.username;return {title:(user.name||user.username)+" Profile",description:"View "+(user.name||user.username)+"'s published wallpapers.",alternates:{canonical},openGraph:{type:"profile",title:(user.name||user.username)+" · Wallpaper profile",url:canonical}};}

export default async function PublicProfilePage({params}:Props){
  const {username}=await params;const user=await getProfile(username);if(!user)notFound();const session=await getActiveSession(),isSelf=Boolean(session?.user?.id===String(user._id));
  const [wallpapers,followers,followingCount,totalItems,totalDownloads,viewerFollowing]=await Promise.all([Wallpaper.find({publisherId:user._id,status:"published"}).sort({publishedAt:-1,createdAt:-1}).limit(60).select("slug title category devices variants publishedAt likeCount downloadCount").lean(),Follow.countDocuments({followingId:user._id}),Follow.countDocuments({followerId:user._id}),Wallpaper.countDocuments({publisherId:user._id,status:"published"}),Wallpaper.aggregate([{$match:{publisherId:user._id,status:"published"}},{$group:{_id:null,total:{$sum:{$ifNull:["$downloadCount",0]}}}}]).then(rows=>Number(rows[0]?.total)||0),session&&!isSelf?Follow.exists({followerId:session.user.id,followingId:user._id}):Promise.resolve(false)]);
  const deviceKeys=["desktop","tablet","mobile"] as const,avatarUrl=user.avatarKey?signedMediaUrl(user.avatarKey):null;
  return <main className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
    <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 md:flex-row md:items-start">
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-3xl font-black text-white ring-4 ring-slate-100 sm:size-28">{avatarUrl?<Image className="protected-image size-full object-cover" src={avatarUrl} alt="" width={112} height={112} unoptimized/>:<span>{(user.name||"U").slice(0,1).toUpperCase()}</span>}</div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="m-0 break-words text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">{user.name||user.username}</h1>{user.role==="publisher"&&user.isVerified?<VerifiedBadge label="Verified publisher"/>:null}</div><p className="mt-1 text-sm font-bold text-slate-500">@{user.username}</p><ProfileStats username={user.username} followers={followers} following={followingCount} wallpapers={totalItems}/><div className="mt-3 grid max-w-xl grid-cols-3 gap-2">{[["Created",user.createdAt?new Date(user.createdAt).toLocaleDateString():"—"],["Total items",totalItems.toLocaleString()],["Total downloads",totalDownloads.toLocaleString()]].map(([label,value])=><div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5" key={label}><strong className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{label}</strong><span className="mt-1 block text-sm font-black text-slate-900">{value}</span></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><ProfileFollowButton username={user.username} initialFollowing={Boolean(viewerFollowing)} isSelf={isSelf} authenticated={Boolean(session)}/><ProfileShareButton username={user.username} name={user.name||user.username}/></div><div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">{user.role==="publisher"?(user.isVerified?"Verified publisher":"Publisher"):"Member"}</span><span className="text-xs font-semibold text-slate-400">Public profile · private account details hidden</span></div></div>
    </section>
    <section className="mt-8"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Published collection</p><h2 className="mt-1 text-2xl font-black tracking-[-0.025em] text-slate-950">Wallpapers by @{user.username}</h2></div><Link className="inline-flex min-h-10 items-center justify-center self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 sm:self-auto" href="/items">Browse all wallpapers</Link></div>{wallpapers.length===0?<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center shadow-sm"><h2 className="text-lg font-black text-slate-950">No published wallpapers yet</h2><p className="mt-1 text-sm text-slate-500">This profile has no public wallpaper posts.</p></div>:<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{wallpapers.map(item=>{const device=(item.devices?.[0]||"desktop") as typeof deviceKeys[number],variant=item.variants?.[device];return <WallpaperCard key={String(item._id)} slug={item.slug} title={item.title} category={item.category} likes={item.likeCount} downloads={item.downloadCount} imageUrl={variant?.key?signedMediaUrl(variant.key):undefined} devices={item.devices||["desktop"]} publishedAt={item.publishedAt?new Date(item.publishedAt).toISOString():null}/>;})}</div>}</section>
  </main>;
}
