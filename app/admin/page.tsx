import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function AdminPage(){
  const session=await getServerSession(authOptions); if(!session) redirect("/login"); if(session.user.role!=="admin") redirect("/account");
  return <main className="container" style={{padding:"48px 0 80px"}}><h1 style={{fontSize:40}}>Admin dashboard</h1><p className="muted">Moderation, publishers, users, wallpapers, reports, analytics and processing controls.</p></main>;
}