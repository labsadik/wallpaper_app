import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import AdminUserTable from "@/components/admin-user-table";

export const dynamic="force-dynamic";

export default async function AdminUsersPage(){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  if(session.user.role!=="admin")redirect("/account");

  await connectDB();
  const users=await User.find({})
    .select("name email role status suspensionUntil suspensionReason banReason createdAt")
    .sort({createdAt:-1})
    .limit(100)
    .lean();

  return <main className="container" style={{padding:"42px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Admin Console</p>
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",margin:0}}>Users</h1>
        <p className="muted" style={{maxWidth:720,margin:"10px 0 0"}}>Observe accounts, change roles, suspend for a defined period, or ban accounts. Expired suspensions automatically become active.</p>
      </div>
      <Link href="/admin" className="btn">Back to admin</Link>
    </div>

    <div className="card" style={{padding:16,marginTop:20}}>
      <strong>{users.length} accounts shown</strong>
      <span className="muted" style={{marginLeft:8,fontSize:13}}>Newest first</span>
    </div>

    <div style={{marginTop:16}}>
      <AdminUserTable users={users.map(user=>({
        _id:String(user._id),
        name:user.name,
        email:user.email,
        role:user.role as "user"|"publisher"|"admin",
        status:user.status as "active"|"suspended"|"banned",
        suspensionUntil:user.suspensionUntil?new Date(user.suspensionUntil):null,
        suspensionReason:user.suspensionReason,
        banReason:user.banReason,
        createdAt:user.createdAt?new Date(user.createdAt):undefined
      }))} currentAdminId={session.user.id}/>
    </div>
  </main>;
}
