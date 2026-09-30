import Link from "next/link";
import Image from "next/image";
import type {Session} from "next-auth";
import LogoutButton from "@/components/logout-button";
import {signedMediaUrl} from "@/lib/media";
import VerifiedBadge from "@/components/verified-badge";

export default function Header({session}:{session:Session|null}){
  const role=session?.user?.role;
  const displayName=session?.user?.name||session?.user?.email||"Account";
  const avatarUrl=session?.user?.avatarKey?signedMediaUrl(session.user.avatarKey):null;

  return <header className="site-header">
    <div className="container site-header-inner">
      <Link href="/" className="brand">Wallpaper</Link>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/wallpapers" className="nav-link">Wallpapers</Link>
        {role==="publisher"||role==="admin"?<Link href="/publisher" className="nav-link">Publisher</Link>:null}
        {role==="admin"?<Link href="/admin" className="nav-link">Admin</Link>:null}
        {session
          ? <div className="nav-account">
              <Link href={session.user.username?"/profile/"+session.user.username:"/account"} className="account-chip" title={session.user?.email||displayName}>
                <span className="account-avatar">{avatarUrl?<Image src={avatarUrl} alt="" width={28} height={28} draggable={false} className="protected-image"/>:displayName.slice(0,1).toUpperCase()}</span>
                <span className="account-name">{displayName}</span>
                {role==="publisher"&&session.user.isVerified?<VerifiedBadge/>:null}
              </Link>
              <LogoutButton/>
            </div>
          : <Link href="/login" className="btn btn-primary">Login</Link>}
      </nav>
    </div>
  </header>;
}
