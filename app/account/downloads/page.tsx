import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import Download from "@/models/Download";
import PageShell from "@/components/page-shell";
import {redirect} from "next/navigation";
import WallpaperCard from "@/components/wallpaper-card";
import {signedMediaUrl} from "@/lib/media";

export const dynamic="force-dynamic";

export default async function DownloadHistoryPage(){
  const session=await getActiveSession();
  if(!session?.user?.id) redirect("/login");
  await connectDB();

  const rows=await Download.find({userId:session.user.id})
    .sort({createdAt:-1})
    .limit(100)
    .populate("wallpaperId")
    .lean();

  const seen=new Set<string>();
  const items=rows.map((row)=>{
    const w=row.wallpaperId as any;
    if(!w||w.status!=="published") return null;
    const key=String(w._id);
    if(seen.has(key)) return null;
    seen.add(key);
    return {
      slug:w.slug,
      title:w.title,
      category:w.category,
      likes:w.likeCount||0,
      downloads:w.downloadCount||0,
      imageUrl:w.variants?.thumbnail?.key?signedMediaUrl(w.variants.thumbnail.key):undefined,
      devices:w.devices||["desktop","tablet","mobile"]
    };
  }).filter(Boolean);

  return <PageShell eyebrow="Account" title="Download history" description="Recently downloaded wallpapers.">
    {items.length===0?<div className="card" style={{padding:28}}><p className="muted" style={{margin:"0 0 14px"}}>No downloads yet.</p><Link className="btn btn-primary" href="/wallpapers">Browse wallpapers</Link></div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}}>{items.map((item:any)=><WallpaperCard key={item.slug} {...item}/>)}</div>}
  </PageShell>;
}
