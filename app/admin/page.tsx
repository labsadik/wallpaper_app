import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import Download from "@/models/Download";
import PageShell from "@/components/page-shell";

export const dynamic="force-dynamic";

export default async function AdminPage(){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  if(session.user.role!=="admin")redirect("/account");

  await connectDB();

  const [
    users,activeUsers,publishers,admins,published,pending,removed,downloads,recentUsers,recentPosts
  ]=await Promise.all([
    User.countDocuments({}),
    User.countDocuments({status:"active"}),
    User.countDocuments({role:"publisher",status:{$ne:"banned"}}),
    User.countDocuments({role:"admin",status:{$ne:"banned"}}),
    Wallpaper.countDocuments({status:"published"}),
    Wallpaper.countDocuments({status:"pending_review"}),
    Wallpaper.countDocuments({status:"archived"}),
    Download.countDocuments({}),
    User.find({}).select("name email role status createdAt").sort({createdAt:-1}).limit(6).lean(),
    Wallpaper.find({}).select("title slug category status publisherId devices qualityStatus createdAt").populate("publisherId","name email").sort({createdAt:-1}).limit(6).lean()
  ]);

  return <PageShell
    eyebrow="Admin Console"
    title="Platform overview"
    description="Observe users and content, manage account roles and restrictions, and moderate publisher posts."
    actions={<div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Link href="/admin/users" className="btn">Users</Link><Link href="/admin/wallpapers" className="btn">Wallpapers</Link><Link href="/publisher/upload" className="btn btn-primary">Upload</Link></div>}
  >
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
      {[
        ["Users",users],["Active",activeUsers],["Publishers",publishers],["Admins",admins],
        ["Published",published],["Pending review",pending],["Removed",removed],["Downloads",downloads]
      ].map(([label,value])=><div className="card" key={String(label)} style={{padding:18}}>
        <p className="muted" style={{margin:0,fontSize:13}}>{label}</p>
        <strong style={{fontSize:31,display:"block",marginTop:7}}>{value}</strong>
      </div>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:18,marginTop:22}}>
      <section className="card" style={{padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div><h2 style={{fontSize:22,margin:0}}>Recent users</h2><p className="muted" style={{margin:"4px 0 0",fontSize:13}}>Latest accounts and their current roles.</p></div>
          <Link className="btn" href="/admin/users">View all</Link>
        </div>
        <div style={{display:"grid",gap:10,marginTop:16}}>
          {recentUsers.map(user=><Link href={"/admin/users/"+String(user._id)} key={String(user._id)} className="card" style={{padding:12}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
              <strong style={{overflowWrap:"anywhere"}}>{user.name}</strong>
              <span className="badge">{user.role}</span>
            </div>
            <span className="muted" style={{fontSize:12,display:"block",marginTop:4,overflowWrap:"anywhere"}}>{user.email}</span>
            <span className={user.status==="active"?"badge badge-selected":"badge"} style={{marginTop:7}}>{user.status}</span>
          </Link>)}
        </div>
      </section>

      <section className="card" style={{padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div><h2 style={{fontSize:22,margin:0}}>Recent posts</h2><p className="muted" style={{margin:"4px 0 0",fontSize:13}}>Inspect titles, categories, devices and moderation state.</p></div>
          <Link className="btn" href="/admin/wallpapers">View all</Link>
        </div>
        <div style={{display:"grid",gap:10,marginTop:16}}>
          {recentPosts.map(item=>{
            const publisher=item.publisherId as any;
            return <div className="card" key={String(item._id)} style={{padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"start"}}>
                <div style={{minWidth:0}}>
                  <strong style={{display:"block",overflowWrap:"anywhere"}}>{item.title}</strong>
                  <span className="muted" style={{fontSize:12}}>{item.category} · {publisher?.name||"Unknown"}</span>
                </div>
                <span className="badge">{item.status}</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                {(item.devices||["desktop","tablet","mobile"]).map((device:string)=><span className="badge" key={device}>{device==="desktop"?"PC":device==="tablet"?"Tablet":"Mobile"}</span>)}
                <span className="badge">{item.qualityStatus}</span>
              </div>
            </div>;
          })}
        </div>
      </section>
    </div>
  </PageShell>;
}
