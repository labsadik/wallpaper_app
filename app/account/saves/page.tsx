import Link from "next/link";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import Save from "@/models/Save";
import PageShell from "@/components/page-shell";
import WallpaperCard from "@/components/wallpaper-card";
import {bunnyPublicUrl} from "@/lib/bunny";

export const dynamic="force-dynamic";

export default async function SavedWallpapersPage(){
  const session=await getServerSession(authOptions);
  if(!session?.user?.id) return null;
  await connectDB();

  const rows=await Save.find({userId:session.user.id})
    .sort({createdAt:-1})
    .limit(100)
    .populate("wallpaperId")
    .lean();

  const items=rows.map((row)=>{
    const w=row.wallpaperId as any;
    if(!w||w.status!=="published") return null;
    return {
      slug:w.slug,
      title:w.title,
      category:w.category,
      likes:w.likeCount||0,
      downloads:w.downloadCount||0,
      imageUrl:w.variants?.thumbnail?.key?bunnyPublicUrl(w.variants.thumbnail.key):undefined
    };
  }).filter(Boolean);

  return <PageShell eyebrow="Account" title="Saved wallpapers" description="Your saved collection.">
    {items.length===0?<div className="card" style={{padding:28}}><p className="muted" style={{margin:"0 0 14px"}}>You have not saved any published wallpapers yet.</p><Link className="btn btn-primary" href="/wallpapers">Browse wallpapers</Link></div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}}>{items.map((item:any)=><WallpaperCard key={item.slug} {...item}/>)}</div>}
  </PageShell>;
}
