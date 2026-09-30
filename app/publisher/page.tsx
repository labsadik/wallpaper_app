import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {bunnyPublicUrl} from "@/lib/bunny";
import WallpaperCard from "@/components/wallpaper-card";

const STATUS_LABELS=[["processing","Processing"],["pending_review","Pending review"],["published","Published"]] as const;

export default async function PublisherPage(){
  const session=await getActiveSession();
  if(!session) redirect("/login");
  if(!["publisher","admin"].includes(session.user.role)) redirect("/account");

  await connectDB();
  const publisherFilter=session.user.role==="admin"?{}:{publisherId:session.user.id};
  const [items,counts]=await Promise.all([
    Wallpaper.find(publisherFilter).sort({createdAt:-1}).limit(12).lean(),
    Promise.all(STATUS_LABELS.map(async([status])=>[status,await Wallpaper.countDocuments({...publisherFilter,status})] as const))
  ]);
  const countMap=Object.fromEntries(counts) as Record<string,number>;

  return <main className="container" style={{padding:"48px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:18,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Publisher Studio</p>
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",margin:0}}>Your wallpapers</h1>
        <p className="muted" style={{maxWidth:720,margin:"10px 0 0"}}>Upload once. Preview, category, target devices, quality and optimized variants stay attached to each wallpaper.</p>
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
          <p className="muted" style={{margin:"4px 0 0"}}>Category, status and target devices are shown on every item.</p>
        </div>
      </div>

      {items.length===0
        ? <div className="card" style={{padding:28}}>
            <h3 style={{margin:"0 0 8px",fontSize:20}}>No uploads yet</h3>
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
                imageUrl={item.variants?.thumbnail?.key?bunnyPublicUrl(item.variants.thumbnail.key):undefined}
                devices={item.devices||["desktop","tablet","mobile"]}
              />
              <div style={{display:"flex",gap:7,flexWrap:"wrap",padding:"0 2px"}}>
                <span className="badge">{item.status==="pending_review"?"Pending review":item.status}</span>
                <span className={item.qualityStatus==="pass"?"badge badge-selected":"badge"}>{item.qualityStatus}</span>
              </div>
            </div>)}
          </div>
      }
    </section>

    <div className="card" style={{padding:22,marginTop:28}}>
      <h2 style={{fontSize:22,margin:0}}>Automatic processing</h2>
      <p className="muted" style={{marginTop:8}}>Format and integrity → resolution/quality signal → duplicate check → optimization → desktop/tablet/mobile/thumbnail variants → review. Your selected target devices are stored as metadata and shown throughout the UI.</p>
    </div>
  </main>;
}
