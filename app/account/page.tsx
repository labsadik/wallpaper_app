import Link from "next/link";
import Image from "next/image";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import PageShell from "@/components/page-shell";
import ProfileAvatarForm from "@/components/profile-avatar-form";
import VerifiedBadge from "@/components/verified-badge";
import {signedMediaUrl} from "@/lib/media";

export default async function AccountPage(){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  const role=session.user.role;
  const avatarUrl=session.user.avatarKey?signedMediaUrl(session.user.avatarKey):null;

  return <PageShell eyebrow="Account" title={session.user.name||"Your account"} description={session.user.email||undefined}>
    <section className="card account-profile-card">
      <div className="profile-avatar-large">
        {avatarUrl
          ? <Image
              className="protected-image"
              draggable={false}
              src={avatarUrl}
              alt="Profile avatar"
              width={96}
              height={96}
              unoptimized
              style={{width:"100%",height:"100%",objectFit:"cover"}}
            />
          : <span>{(session.user.name||"U").slice(0,1).toUpperCase()}</span>}
      </div>
      <div className="account-profile-details">
        <div className="account-name-row">
          <h2>{session.user.name||"Account"}</h2>
          {role==="publisher"&&session.user.isVerified?<VerifiedBadge/>:null}
        </div>
        <p className="muted">@{session.user.username||"user"} {session.user.username?<><span> · </span><Link href={"/profile/"+session.user.username} style={{textDecoration:"underline"}}>View public profile</Link></>:null}</p>
        <div className="account-badges">
          <span className="badge">{role}</span>
          <span className={session.user.status==="active"?"badge badge-selected":"badge"}>{session.user.status}</span>
          {role==="publisher"?<span className="badge">{session.user.isVerified?"Verified publisher":"Not verified"}</span>:null}
        </div>
      </div>
    </section>

    <div style={{marginTop:16}}><ProfileAvatarForm name={session.user.name||"User"} avatarUrl={avatarUrl}/></div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:20}}>
      {[
        ["Saved wallpapers","Your saved collection","/account/saves"],
        ["Download history","Recently downloaded wallpapers","/account/downloads"],
        [role==="admin"?"Admin console":role==="publisher"?"Publisher Studio":"Publisher access",role==="user"?"Publishing access is managed by the platform.":"Manage your publishing tools",role==="user"?"/account":role==="admin"?"/admin":"/publisher"]
      ].map(([title,desc,href])=><Link href={href} className="card" key={title} style={{padding:20}}><h2 style={{fontSize:20,margin:"0 0 8px"}}>{title}</h2><p className="muted" style={{margin:0}}>{desc}</p></Link>)}
    </div>
  </PageShell>;
}
