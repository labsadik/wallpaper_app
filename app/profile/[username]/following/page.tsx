import Link from "next/link";
import {notFound} from "next/navigation";
import User from "@/models/User";
import Follow from "@/models/Follow";
import {connectDB} from "@/lib/mongodb";
import ProfileUserRow from "@/components/profile-user-row";

export const dynamic="force-dynamic";

export default async function FollowingPage({params}:{params:Promise<{username:string}>}){
  const {username}=await params;
  await connectDB();
  const user=await User.findOne({username:username.toLowerCase(),status:"active"}).select("name username").lean();
  if(!user)notFound();

  const relations=await Follow.find({followerId:user._id}).sort({createdAt:-1}).limit(100).select("followingId").lean();
  const ids=relations.map(row=>row.followingId);
  const users=ids.length
    ? await User.find({_id:{$in:ids},status:"active"}).select("name username role isVerified avatarKey").lean()
    : [];
  const byId=new Map(users.map(item=>[String(item._id),item]));
  const ordered=ids.map(id=>byId.get(String(id))).filter(Boolean);

  return <main className="container public-profile-page">
    <div className="connection-page-head">
      <div>
        <p className="muted" style={{margin:"0 0 4px",fontWeight:700}}>Social profile</p>
        <h1>{user.name||user.username} is Following</h1>
        <p className="muted">@{user.username} · {ordered.length} shown</p>
      </div>
      <Link className="btn" href={"/profile/"+user.username}>Back to profile</Link>
    </div>
    <section className="card profile-connections-card">
      {ordered.length===0
        ? <div className="empty-state"><h2>Not following anyone yet</h2><p className="muted">Profiles followed by @{user.username} will appear here.</p></div>
        : <div className="profile-connections-list">{ordered.map(item=><ProfileUserRow key={String(item!._id)} user={item! as any}/>)}</div>}
    </section>
  </main>;
}
