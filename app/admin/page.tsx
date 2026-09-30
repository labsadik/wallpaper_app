import Link from "next/link";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";
import PageShell from "@/components/page-shell";

const stats=[["Published wallpapers","0"],["Pending review","0"],["Publishers","0"],["Downloads","0"]];
const queue=[["No pending wallpaper reviews yet","Your processing and moderation queue will appear here."],["No publisher applications","New publisher applications will appear here."]];

export default async function AdminPage(){
  const session=await getServerSession(authOptions);
  if(!session) redirect("/login");
  if(session.user.role!=="admin") redirect("/account");
  return <PageShell eyebrow="Admin Console" title="Platform overview" description="Manage wallpapers, publishers, users, moderation, analytics and processing." actions={<Link href="/publisher/upload" className="btn btn-primary">Upload wallpaper</Link>}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
      {stats.map(([label,value])=><div className="card" key={label} style={{padding:20}}><p className="muted" style={{margin:0,fontSize:13}}>{label}</p><strong style={{fontSize:34,display:"block",marginTop:8}}>{value}</strong></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18,marginTop:22}}>
      <section className="card" style={{padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:22,margin:0}}>Moderation queue</h2><span className="muted">Today</span></div><div style={{display:"grid",gap:12,marginTop:16}}>{queue.map(([title,desc])=><div key={title} style={{padding:15,border:"1px solid var(--line)",borderRadius:14}}><strong>{title}</strong><p className="muted" style={{margin:"6px 0 0",fontSize:13}}>{desc}</p></div>)}</div></section>
      <section className="card" style={{padding:20}}><h2 style={{fontSize:22,margin:0}}>Admin tools</h2><div style={{display:"grid",gap:10,marginTop:16}}>{["Wallpapers","Publishers","Users","Reports","Categories","Processing"].map(x=><Link key={x} href="/admin" className="btn" style={{justifyContent:"space-between"}}><span>{x}</span><span>→</span></Link>)}</div></section>
    </div>
  </PageShell>;
}