import Link from "next/link";
import {notFound} from "next/navigation";
import User from "@/models/User";
import Follow from "@/models/Follow";
import {connectDB} from "@/lib/mongodb";
import ProfileUserRow from "@/components/profile-user-row";

export const dynamic="force-dynamic";

export default async function FollowersPage({params}:{params:Promise<{username:string}>}){
  const {username}=await params;await connectDB();const user=await User.findOne({username:username.toLowerCase(),status:"active"}).select("name username role isVerified").lean();if(!user)notFound();
  const relations=await Follow.find({followingId:user._id}).sort({createdAt:-1}).limit(100).select("followerId").lean(),ids=relations.map(row=>row.followerId);
  const users=ids.length?await User.find({_id:{$in:ids},status:"active",username:{$exists:true,$ne:null}}).select("name username role isVerified avatarKey").lean():[];const byId=new Map(users.map(item=>[String(item._id),item])),ordered=ids.map(id=>byId.get(String(id))).filter(Boolean);
  return <main className="mx-auto w-full max-w-[900px] px-5 pb-20 pt-7 sm:px-6 sm:pt-10"><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Social profile</p><h1 className="mt-1 break-words text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{user.name||user.username}&apos;s Followers</h1><p className="mt-1 text-sm font-semibold text-slate-500">@{user.username} · {ordered.length} shown</p></div><Link className="inline-flex min-h-10 items-center justify-center self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 sm:self-auto" href={"/profile/"+user.username}>Back to profile</Link></div><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{ordered.length===0?<div className="p-9 text-center"><h2 className="text-lg font-black text-slate-950">No followers yet</h2><p className="mt-1 text-sm text-slate-500">People who follow @{user.username} will appear here.</p></div>:ordered.map(item=><ProfileUserRow key={String(item!._id)} user={item! as any}/>)}</section></main>;
}
