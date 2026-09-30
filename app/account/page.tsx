import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function AccountPage(){
  const session=await getServerSession(authOptions); if(!session) redirect("/login");
  return <main className="container" style={{padding:"48px 0 80px"}}>
    <h1 style={{fontSize:40}}>Account</h1>
    <div className="card" style={{padding:22,marginTop:20}}>
      <p><strong>{session.user?.name}</strong></p><p className="muted">{session.user?.email}</p><p className="muted">Role: {session.user?.role}</p>
    </div>
  </main>;
}