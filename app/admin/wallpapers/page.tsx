import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";
import AdminWallpaperActions from "@/components/admin-wallpaper-actions";
import {bunnyPublicUrl} from "@/lib/bunny";

export const dynamic="force-dynamic";

export default async function AdminWallpapersPage(){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  if(session.user.role!=="admin")redirect("/account");

  await connectDB();
  const items=await Wallpaper.find({})
    .sort({createdAt:-1})
    .limit(100)
    .populate("publisherId","name email")
    .lean();

  return <main className="container" style={{padding:"42px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Admin Console</p>
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",margin:0}}>Wallpapers</h1>
        <p className="muted" style={{maxWidth:720,margin:"10px 0 0"}}>Review submitted posts, inspect publisher ownership, and remove or restore posts without deleting their records.</p>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Link href="/admin" className="btn">Back to admin</Link>
        <Link href="/publisher/upload" className="btn btn-primary">Upload</Link>
      </div>
    </div>

    <div style={{display:"grid",gap:12,marginTop:20}}>
      {items.length===0
        ? <div className="card" style={{padding:24}}><p className="muted" style={{margin:0}}>No wallpaper records yet.</p></div>
        : items.map(item=>{
          const publisher=item.publisherId as any;
          return <article className="card" key={String(item._id)} style={{padding:14}}>
            <div style={{display:"grid",gridTemplateColumns:"minmax(140px,230px) minmax(0,1fr) auto",gap:16,alignItems:"center"}}>
              <div>
                {item.variants?.thumbnail?.key
                  ? <img src={bunnyPublicUrl(item.variants.thumbnail.key)} alt={item.title} style={{display:"block",width:"100%",aspectRatio:"16/10",objectFit:"cover",borderRadius:12}}/>
                  : <div style={{aspectRatio:"16/10",borderRadius:12,background:"#0d1118"}}/>
                }
              </div>
              <div style={{minWidth:0}}>
                <h2 style={{fontSize:18,margin:"0 0 6px",overflowWrap:"anywhere"}}>{item.title}</h2>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <span className="badge">{item.category}</span>
                  <span className="badge">{item.status}</span>
                  <span className="badge">{item.qualityStatus}</span>
                  {(item.devices||["desktop","tablet","mobile"]).map((device:string)=><span className="badge" key={device}>{device==="desktop"?"PC":device==="tablet"?"Tablet":"Mobile"}</span>)}
                </div>
                <p className="muted" style={{fontSize:12,margin:"7px 0 0"}}>
                  Publisher: {publisher?.name||"Unknown"} · {publisher?.email||""}
                </p>
                <p className="muted" style={{fontSize:12,margin:"4px 0 0"}}>
                  {item.likeCount||0} likes · {item.saveCount||0} saves · {item.downloadCount||0} downloads
                </p>
                {item.moderationReason?<p className="muted" style={{fontSize:12,margin:"6px 0 0"}}>{item.moderationReason}</p>:null}
              </div>
              <AdminWallpaperActions wallpaperId={String(item._id)} status={item.status}/>
            </div>
          </article>;
        })}
    </div>
  </main>;
