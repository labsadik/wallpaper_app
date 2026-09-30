import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import AutoPublishIndicator from "@/components/auto-publish-indicator";
import PublisherWallpaperActions from "@/components/publisher-wallpaper-actions";
import WallpaperCard from "@/components/wallpaper-card";

const STATUS_LABELS=[["processing","Processing"],["pending_review","Pending review"],["published","Published"]] as const;

export const dynamic="force-dynamic";

export default async function PublisherPage(){
  const session=await getActiveSession();
  if(!session) redirect("/login");
  if(!["publisher","admin"].includes(session.user.role)) redirect("/account");

  await connectDB();
  await autoPublishDueWallpapers();
  const publisherFilter=session.user.role==="admin"?{}:{publisherId:session.user.id};
  const [items,counts]=await Promise.all([
    Wallpaper.find({...publisherFilter,status:{$ne:"archived"}}).sort({createdAt:-1}).limit(12).lean(),
    Promise.all(STATUS_LABELS.map(async([status])=>[status,await Wallpaper.countDocuments({...publisherFilter,status})] as const))
  ]);
  const countMap=Object.fromEntries(counts) as Record<string,number>;

  return <main className="container" style={{padding:"48px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:18,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Publisher Studio</p>
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",margin:0}}>Your wallpapers</h1>
        <p className="muted" style={{maxWidth:720,margin:"10px 0 0"}}>Upload once. Processing is automatic; every new wallpaper is scheduled to publish 20 seconds after processing completes.</p>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <Link href="/publisher/upload" className="btn btn-primary">Upload wallpaper</Link>
        <Link href="/wallpapers" className="btn">View gallery</Link>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginTop:24}}>
      {STATUS_LABELS.map(([status,label])=><div className="card" key={status} style={{padding:20}}>
        <p className="muted" style={{margin:0,fontSize:13}}>{label}</p>
        <strong style={{fontSize:32,display:"block",marginTop:7}}>{countMap[status]||0}</strong>
      </div>)}
    </div>

    <section style={{marginTop:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:14}}>
        <div>
          <h2 style={{fontSize:24,margin:0}}>Recent uploads</h2>
          <p className="muted" style={{margin:"4px 0 0"}}>Category, status, target devices and publishing controls are shown on every item.</p>
        </div>
      </div>

      {items.length===0
        ? <div className="card" style={{padding:28}}>
            <h3 style={{margin:"0 0 8px",fontSize:20}}>No active uploads</h3>
            <p className="muted" style={{margin:"0 0 16px"}}>Start with an image, choose its category and select PC, Tablet or Mobile.</p>
            <Link href="/publisher/upload" className="btn btn-primary">Create first upload</Link>
          </div>
        : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {items.map(item=><div key={String(item._id)} style={{display:"grid",gap:8}}>
              <WallpaperCard
                slug={item.slug}
                title={item.title}
                category={item.category}
                likes={item.likeCount}
                downloads={item.downloadCount}
                imageUrl={item.variants?.thumbnail?.key?signedMediaUrl(item.variants.thumbnail.key):undefined}
                devices={item.devices||["desktop","tablet","mobile"]}
                publishedAt={item.publishedAt?new Date(item.publishedAt).toISOString():null}
              />
              <div style={{display:"flex",gap:7,flexWrap:"wrap",padding:"0 2px",alignItems:"center"}}>
                <AutoPublishIndicator wallpaperId={String(item._id)} status={item.status} publishAt={item.publishAt?new Date(item.publishAt).toISOString():null}/>
                <span className={item.qualityStatus==="pass"?"badge badge-selected":"badge"}>{item.qualityStatus}</span>
                <PublisherWallpaperActions wallpaperId={String(item._id)} status={item.status}/>
              </div>
            </div>)}
          </div>
      }
    </section>

    <div className="card" style={{padding:22,marginTop:28}}>
      <h2 style={{fontSize:22,margin:0}}>Automatic publishing</h2>
      <p className="muted" style={{marginTop:8}}>New uploads enter Pending review with an automatic publish time 20 seconds later. The publisher screen shows the countdown and can publish immediately or delete the publisher’s own post. Server-side due checks also publish overdue pending items when the app is accessed.</p>
    </div>
  </main>;
}
