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
  const links=[
    ["Saved wallpapers","Your saved collection","/account/saves"],
    ["Download history","Recently downloaded wallpapers","/account/downloads"],
    [role==="admin"?"Admin console":role==="publisher"?"Publisher Studio":"Publisher access",role==="user"?"Publishing access is managed by the platform.":"Manage your publishing tools",role==="user"?"/account":role==="admin"?"/admin":"/publisher"],
  ] as const;

  return <PageShell eyebrow="Account" title={session.user.name||"Your account"} description={session.user.email||undefined}>
    <div className="grid gap-5">
      <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-2xl font-black text-white ring-4 ring-slate-100">
          {avatarUrl?<Image className="protected-image size-20 object-cover" src={avatarUrl} alt="Profile avatar" width={80} height={80} unoptimized/>:<span>{(session.user.name||"U").slice(0,1).toUpperCase()}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="m-0 text-2xl font-black tracking-[-0.025em] text-slate-950">{session.user.name||"Account"}</h2>{role==="publisher"&&session.user.isVerified?<VerifiedBadge/>:null}</div>
          <p className="mt-1 break-words text-sm font-semibold text-slate-500">@{session.user.username||"user"} {session.user.username?<><span className="mx-1">·</span><Link className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700" href={"/profile/"+session.user.username}>View public profile</Link></>:null}</p>
          <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">{role}</span><span className={session.user.status==="active"?"rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700":"rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600"}>{session.user.status}</span>{role==="publisher"?<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">{session.user.isVerified?"Verified publisher":"Not verified"}</span>:null}</div>
        </div>
      </section>

      <ProfileAvatarForm name={session.user.name||"User"} avatarUrl={avatarUrl}/>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(([title,desc,href])=><Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md" key={title}><div className="flex items-start justify-between gap-3"><div><h2 className="m-0 text-base font-black text-slate-950">{title}</h2><p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p></div><span className="text-lg text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600">→</span></div></Link>)}
      </section>
    </div>
  </PageShell>;
}
