import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function PublisherPage(){
  const session=await getServerSession(authOptions); if(!session) redirect("/login"); if(!["publisher","admin"].includes(session.user.role)) redirect("/account");
  return <main className="container" style={{padding:"48px 0 80px"}}>
    <h1 style={{fontSize:40}}>Publisher dashboard</h1><p className="muted">Upload processing and your wallpaper management will live here.</p>
    <div className="card" style={{padding:22,marginTop:20}}><h2 style={{fontSize:24}}>Automatic processing</h2><p className="muted">Validation → quality check → duplicate check → optimization → desktop/tablet/mobile variants → review.</p></div>
  </main>;
}