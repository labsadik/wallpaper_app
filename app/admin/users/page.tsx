import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import AdminUserTable from "@/components/admin-user-table";

export const dynamic="force-dynamic";

type SearchParams={q?:string;role?:string;status?:string};

export default async function AdminUsersPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const session=await getActiveSession();
  if(!session)redirect("/login");
  if(session.user.role!=="admin")redirect("/account");

  const params=await searchParams;
  const q=(params.q||"").trim();
  const role=(params.role||"").trim();
  const status=(params.status||"").trim();

  await connectDB();
  const filter:Record<string,unknown>={};
  if(role&&["user","publisher","admin"].includes(role))filter.role=role;
  if(status&&["active","suspended","banned"].includes(status))filter.status=status;
  if(q)filter.$or=[{name:{$regex:q,$options:"i"}},{email:{$regex:q,$options:"i"}}];

  const users=await User.find(filter)
    .select("name username email role status isVerified suspensionUntil suspensionReason banReason createdAt")
    .sort({createdAt:-1})
    .limit(100)
    .lean();

  const makeQuery=(next:{q?:string;role?:string;status?:string}={})=>{
    const values={q:q||undefined,role:role||undefined,status:status||undefined,...next};
    return Object.entries(values).filter(([,value])=>value).map(([key,value])=>key+"="+encodeURIComponent(String(value))).join("&");
  };

  return <main className="container" style={{padding:"42px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:16,flexWrap:"wrap"}}>
      <div>
        <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Admin Console</p>
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",margin:0}}>Users</h1>
        <p className="muted" style={{maxWidth:720,margin:"10px 0 0"}}>Observe accounts, change roles, suspend for a defined period, or ban accounts. Expired suspensions automatically become active.</p>
      </div>
      <Link href="/admin" className="btn">Back to admin</Link>
    </div>

    <form method="get" className="card" style={{padding:14,marginTop:20,display:"grid",gridTemplateColumns:"minmax(220px,1fr) 180px 180px auto",gap:10}}>
      <input name="q" defaultValue={q} placeholder="Search name or email…" style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      <select name="role" defaultValue={role} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}>
        <option value="">All roles</option><option value="user">User</option><option value="publisher">Publisher</option><option value="admin">Admin</option>
      </select>
      <select name="status" defaultValue={status} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}>
        <option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
      </select>
      <div style={{display:"flex",gap:8}}><button className="btn btn-primary" type="submit">Filter</button><Link className="btn" href="/admin/users">Reset</Link></div>
    </form>

    <div className="card" style={{padding:14,marginTop:12}}>
      <strong>{users.length} accounts shown</strong>
      <span className="muted" style={{marginLeft:8,fontSize:13}}>Newest first · click a user name to inspect their posts</span>
    </div>

    <div style={{marginTop:16}}>
      <AdminUserTable users={users.map(user=>({
        _id:String(user._id),
        name:user.name,
        email:user.email,
        role:user.role as "user"|"publisher"|"admin",
        status:user.status as "active"|"suspended"|"banned",
        isVerified:Boolean(user.isVerified),
        suspensionUntil:user.suspensionUntil?new Date(user.suspensionUntil):null,
        suspensionReason:user.suspensionReason,
        banReason:user.banReason,
        createdAt:user.createdAt?new Date(user.createdAt):undefined
      }))} currentAdminId={session.user.id}/>
    </div>
  </main>;
}
