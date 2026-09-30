import Link from "next/link";
import Image from "next/image";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import AdminWallpaperActions from "@/components/admin-wallpaper-actions";
import {signedMediaUrl} from "@/lib/media";
import AdminBulkPublish from "@/components/admin-bulk-publish";
import PublishedAt from "@/components/published-at";
import {getPreferredWallpaperDevice} from "@/lib/wallpaper-devices";

export const dynamic="force-dynamic";

type SearchParams={q?:string;status?:string;category?:string};

export default async function AdminWallpapersPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  if(session.user.role!=="admin")redirect("/account");

  const params=await searchParams;
  const q=(params.q||"").trim();
  const status=(params.status||"").trim();
  const category=(params.category||"").trim();

  await connectDB();
  const {autoPublishDueWallpapers}=await import("@/lib/wallpaper-publish");
  await autoPublishDueWallpapers();
  const filter:Record<string,unknown>={};
  if(status&&["draft","processing","pending_review","published","rejected","archived"].includes(status))filter.status=status;
  if(category)filter.category=category;
  if(q)filter.$or=[{title:{$regex:q,$options:"i"}},{category:{$regex:q,$options:"i"}}];

  const [items,categories]=await Promise.all([
    Wallpaper.find(filter).sort({createdAt:-1}).limit(100).populate("publisherId","name email").lean(),
    Wallpaper.distinct("category")
  ]);

  return <main className="container" style={{padding:"42px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Admin Console</p>
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",margin:0}}>Wallpapers</h1>
        <p className="muted" style={{maxWidth:720,margin:"10px 0 0"}}>Inspect every post, see its publisher, title, category, devices and moderation state, then remove or restore it.</p>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Link href="/admin" className="btn">Back to admin</Link>
        <AdminBulkPublish/>
        <Link href="/publisher/upload" className="btn">Upload</Link>
      </div>
    </div>

    <form method="get" className="card" style={{padding:14,marginTop:20,display:"grid",gridTemplateColumns:"minmax(220px,1fr) 180px 180px auto",gap:10}}>
      <input name="q" defaultValue={q} placeholder="Search title or category…" style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--line)",background:"var(--input)",color:"var(--text)"}}/>
      <select name="status" defaultValue={status} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}>
        <option value="">All statuses</option>
        <option value="pending_review">Pending review</option><option value="published">Published</option><option value="rejected">Rejected</option><option value="archived">Removed</option><option value="processing">Processing</option><option value="draft">Draft</option>
      </select>
      <select name="category" defaultValue={category} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}>
        <option value="">All categories</option>
        {categories.sort().map(item=><option value={item} key={item}>{item}</option>)}
      </select>
      <div style={{display:"flex",gap:8}}><button className="btn btn-primary" type="submit">Filter</button><Link className="btn" href="/admin/wallpapers">Reset</Link></div>
    </form>

    <div style={{marginTop:16,display:"grid",gap:12}}>
      {items.length===0
        ? <div className="card" style={{padding:24}}><p className="muted" style={{margin:0}}>No wallpapers match the current filters.</p></div>
        : items.map(item=>{
          const publisher=item.publisherId as any;
          const devices=item.devices||["desktop"];
          const device=getPreferredWallpaperDevice(devices);
          return <article className="card" key={String(item._id)} style={{padding:14}}>
            <div className="admin-post-row">
              <div>
                {item.variants?.[item.devices?.[0]||"desktop"]?.key
                  ? <Image src={signedMediaUrl(item.variants?.[device]?.key||"")} alt={item.title} width={460} height={290} sizes="(max-width: 760px) 100vw, 460px" unoptimized style={{display:"block",width:"100%",aspectRatio:"16/10",objectFit:"cover",borderRadius:12}}/>
                  : <div style={{aspectRatio:"16/10",borderRadius:12,background:"#0d1118"}}/>
                }
              </div>
              <div style={{minWidth:0}}>
                <h2 style={{fontSize:18,margin:"0 0 6px",overflowWrap:"anywhere"}}>{item.title}</h2>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <span className="badge">{item.category}</span>
                  <span className="badge">{item.status}</span>
                  <span className={item.qualityStatus==="pass"?"badge badge-selected":"badge"}>{item.qualityStatus}</span>
                  {devices.map((device:string)=><span className="badge" key={device}>{device==="desktop"?"PC":device==="tablet"?"Tablet":"Mobile"}</span>)}
                </div>
                <p className="muted" style={{fontSize:12,margin:"7px 0 0",overflowWrap:"anywhere"}}>Publisher: {publisher?.name||"Unknown"} · {publisher?.email||""}</p>
                <p className="muted" style={{fontSize:12,margin:"4px 0 0"}}>{item.likeCount||0} likes · {item.saveCount||0} saves · {item.downloadCount||0} downloads</p>
                <PublishedAt value={item.publishedAt?new Date(item.publishedAt).toISOString():null}/>
                {item.moderationReason?<p className="muted" style={{fontSize:12,margin:"6px 0 0"}}>{item.moderationReason}</p>:null}
              </div>
              <AdminWallpaperActions wallpaperId={String(item._id)} status={item.status}/>
            </div>
          </article>;
        })}
    </div>
  </main>;
}
