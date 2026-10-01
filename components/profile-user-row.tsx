import Link from "next/link";
import Image from "next/image";
import VerifiedBadge from "@/components/verified-badge";
import {signedMediaUrl} from "@/lib/media";

export default function ProfileUserRow({user}:{user:{name:string;username?:string|null;role:string;isVerified?:boolean;avatarKey?:string|null}}){
  const avatar=user.avatarKey?signedMediaUrl(user.avatarKey):null;
  return <Link href={"/profile/"+user.username} className="group flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 transition last:border-b-0 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"><span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-sm font-black text-white ring-2 ring-slate-100">{avatar?<Image src={avatar} alt="" width={44} height={44} unoptimized className="protected-image size-11 object-cover"/>:<span>{(user.name||"U").slice(0,1).toUpperCase()}</span>}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-slate-900 group-hover:underline">{user.name||user.username}</span><span className="block truncate text-xs font-semibold text-slate-500">@{user.username}</span></span>{user.role==="publisher"&&user.isVerified?<VerifiedBadge/>:null}</Link>;
}