import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import Image from "next/image";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import AdminUserTable from "@/components/admin-user-table";
import AdminWallpaperActions from "@/components/admin-wallpaper-actions";
import PublishedAt from "@/components/published-at";

export const dynamic="force-dynamic";

export default async function AdminUserProfile({params}:{params:Promise<{id:string}>}){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  if(session.user.role!=="admin")redirect("/account");

  const {id}=await params;
  await connectDB();
  const user=await User.findById(id).select("name email role status suspensionUntil suspensionReason banReason createdAt").lean();
  if(!user)notFound();

  const wallpapers=await Wallpaper.find({publisherId:user._id})
    .sort({createdAt:-1})
    .limit(50)
    .lean();

  const account=[{
    _id:String(user._id),
    name:user.name,
    email:user.email,
    role:user.role as "user"|"publisher"|"admin",
    status:user.status as "active"|"suspended"|"banned",
    suspensionUntil:user.suspensionUntil?new Date(user.suspensionUntil):null,
    suspensionReason:user.suspensionReason,
    banReason:user.banReason,
    createdAt:user.createdAt?new Date(user.createdAt):undefined
  }];

  return <main className="container" style={{padding:"42px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>User profile</p>
        <h1 style={{fontSize:"clamp(32px,5vw,46px)",margin:0}}>{user.name}</h1>
        <p className="muted" style={{margin:"8px 0 0",overflowWrap:"anywhere"}}>{user.email}</p>
      </div>
      <Link href="/admin/users" className="btn">All users</Link>
    </div>

    <section style={{marginTop:22}}>
      <h2 style={{fontSize:22,margin:"0 0 12px"}}>Account controls</h2>
      <AdminUserTable users={account} currentAdminId={session.user.id}/>
    </section>

    <section style={{marginTop:30}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:14}}>
        <div>
          <h2 style={{fontSize:22,margin:0}}>Published & submitted posts</h2>
          <p className="muted" style={{margin:"4px 0 0"}}>An administrator can remove a post from public view from this profile.</p>
        </div>
        <span className="badge">{wallpapers.length}</span>
      </div>

      {wallpapers.length===0
        ? <div className="card" style={{padding:24}}><p className="muted" style={{margin:0}}>This account has no wallpaper posts.</p></div>
        : <div style={{display:"grid",gap:14}}>
          {wallpapers.map(item=><article className="card" key={String(item._id)} style={{padding:14}}>
            <div className="admin-post-row" style={{alignItems:"center"}}>
              <Link href={"/wallpapers/"+item.slug} style={{display:"block"}}>
                {item.variants?.thumbnail?.key
                  ? <Image src={signedMediaUrl(item.variants.thumbnail.key)} alt={item.title} width={440} height={275} sizes="(max-width: 760px) 100vw, 440px" unoptimized style={{width:"100%",aspectRatio:"16/10",objectFit:"cover",borderRadius:12,display:"block"}}/>
                  : <div style={{aspectRatio:"16/10",borderRadius:12,background:"#0d1118"}}/>
                }
              </Link>
              <div style={{minWidth:0}}>
                <h3 style={{fontSize:18,margin:"0 0 6px",overflowWrap:"anywhere"}}>{item.title}</h3>
                <PublishedAt value={item.publishedAt?new Date(item.publishedAt).toISOString():null}/>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <span className="badge">{item.category}</span>
                  <span className="badge">{item.status}</span>
                  {(item.devices||["desktop","tablet","mobile"]).map((device:string)=><span className="badge" key={device}>{device==="desktop"?"PC":device==="tablet"?"Tablet":"Mobile"}</span>)}
                </div>
                {item.moderationReason?<p className="muted" style={{fontSize:12,margin:"8px 0 0"}}>{item.moderationReason}</p>:null}
              </div>
              <AdminWallpaperActions wallpaperId={String(item._id)} status={item.status}/>
            </div>
          </article>)}
        </div>
      }
    </section>
  </main>;
}
