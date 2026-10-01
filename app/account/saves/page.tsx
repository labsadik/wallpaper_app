import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import Save from "@/models/Save";
import PageShell from "@/components/page-shell";
import {redirect} from "next/navigation";
import WallpaperCard from "@/components/wallpaper-card";
import {signedMediaUrl} from "@/lib/media";

export const dynamic="force-dynamic";

export default async function SavedWallpapersPage(){
  const session=await getActiveSession();
  if(!session?.user?.id)redirect("/login");
  await connectDB();
  const rows=await Save.find({userId:session.user.id}).sort({createdAt:-1}).limit(100).populate("wallpaperId").lean();
  const items=rows.map(row=>{const w=row.wallpaperId as any;if(!w||w.status!=="published")return null;const device=w.devices?.[0]||"desktop";const variant=w.variants?.[device];return {slug:w.slug,title:w.title,category:w.category,likes:w.likeCount||0,downloads:w.downloadCount||0,imageUrl:variant?.key?signedMediaUrl(variant.key):undefined,imageWidth:variant?.width,imageHeight:variant?.height,devices:w.devices||["desktop"],publishedAt:w.publishedAt?new Date(w.publishedAt).toISOString():null};}).filter(Boolean);

  return <PageShell eyebrow="Account" title="Saved wallpapers" description="Your saved collection.">
    {items.length===0?<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 shadow-sm"><p className="m-0 text-sm leading-6 text-slate-500">You have not saved any published wallpapers yet.</p><Link className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800" href="/items">Browse wallpapers</Link></div>
      :<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item:any)=><WallpaperCard key={item.slug} {...item}/>)}</div>}
  </PageShell>;
}
