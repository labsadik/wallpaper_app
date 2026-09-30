import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import PageShell from "@/components/page-shell";

export default async function AccountPage(){
  const session=await getActiveSession(); if(!session) redirect("/login");
  const role=session.user.role;
  return <PageShell eyebrow="Account" title={session.user.name||"Your account"} description={session.user.email||undefined}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      {[
        ["Saved wallpapers","Your saved collection","/account/saves"],
        ["Download history","Recently downloaded wallpapers","/account/downloads"],
        [role==="admin"?"Admin console":role==="publisher"?"Publisher Studio":"Become a publisher",role==="user"?"Publishing access is managed by the platform.":"Manage your publishing tools",role==="user"?"/account":role==="admin"?"/admin":"/publisher"]
      ].map(([title,desc,href])=><Link href={href} className="card" key={title} style={{padding:20}}><h2 style={{fontSize:20,margin:"0 0 8px"}}>{title}</h2><p className="muted" style={{margin:0}}>{desc}</p></Link>)}
    </div>
  </PageShell>;
}