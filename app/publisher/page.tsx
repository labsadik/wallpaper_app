import Link from "next/link";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function PublisherPage(){
  const session=await getServerSession(authOptions);
  if(!session) redirect("/login");
  if(!["publisher","admin"].includes(session.user.role)) redirect("/account");
  return <main className="container" style={{padding:"48px 0 80px"}}>
    <h1 style={{fontSize:40}}>Publisher dashboard</h1>
    <p className="muted">Upload once. Validation, quality checks, duplicate checks, optimization and device variants are automatic.</p>
    <div style={{display:"flex",gap:12,marginTop:20}}>
      <Link href="/publisher/upload" className="btn btn-primary">Upload wallpaper</Link>
      <Link href="/wallpapers" className="btn">View gallery</Link>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:24}}>
      {["Processing","Pending review","Published"].map(item=><div className="card" key={item} style={{padding:22}}><p className="muted">{item}</p><strong style={{fontSize:30}}>0</strong></div>)}
    </div>
    <div className="card" style={{padding:22,marginTop:20}}>
      <h2 style={{fontSize:24}}>Automatic processing</h2>
      <p className="muted" style={{marginTop:8}}>Technical validation → resolution/ratio check → duplicate detection → compression → desktop/tablet/mobile/thumbnail variants → review.</p>
    </div>
  </main>;
}