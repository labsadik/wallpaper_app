import Link from "next/link";
import Image from "next/image";
import VerifiedBadge from "@/components/verified-badge";
import {signedMediaUrl} from "@/lib/media";

export default function ProfileUserRow({user}:{user:{name:string;username?:string|null;role:string;isVerified?:boolean;avatarKey?:string|null}}){
  const avatar=user.avatarKey?signedMediaUrl(user.avatarKey):null;
  return <Link href={"/profile/"+user.username} className="profile-connection-row">
    <span className="profile-connection-avatar">
      {avatar?<Image src={avatar} alt="" width={48} height={48} draggable={false} unoptimized/>:<span>{(user.name||"U").slice(0,1).toUpperCase()}</span>}
    </span>
    <span className="profile-connection-copy">
      <span className="profile-connection-name">{user.name||user.username}</span>
      <span className="muted">@{user.username}</span>
    </span>
    {user.role==="publisher"&&user.isVerified?<VerifiedBadge/>:null}
  </Link>;
}
