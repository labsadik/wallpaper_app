import Link from "next/link";
import {getActiveSession} from "@/lib/admin";
import {redirect} from "next/navigation";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import AdminUserTable from "@/components/admin-user-table";
import PageShell from "@/components/page-shell";
import {Select,Input} from "@/components/ui";

export const dynamic="force-dynamic";
type SearchParams={q?:string;role?:string;status?:string;verification?:string};

export default async function AdminUsersPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const session=await getActiveSession();if(!session)redirect("/login");if(session.user.role!=="admin")redirect("/account");
  const params=await searchParams,q=(params.q||"").trim(),role=(params.role||"").trim(),status=(params.status||"").trim(),verification=(params.verification||"").trim();
  await connectDB();const filter:Record<string,unknown>={};if(role&&["user","publisher","admin"].includes(role))filter.role=role;if(status&&["active","suspended","banned"].includes(status))filter.status=status;if(verification==="verified"){filter.role="publisher";filter.isVerified=true;}if(verification==="unverified"){filter.role="publisher";filter.isVerified=false;}if(q)filter.$or=[{name:{$regex:q,$options:"i"}},{username:{$regex:q,$options:"i"}},{email:{$regex:q,$options:"i"}}];
  const users=await User.find(filter).select("name username email role status isVerified suspensionUntil suspensionReason banReason createdAt").sort({createdAt:-1}).limit(100).lean();
  const makeQuery=(next:{q?:string;role?:string;status?:string;verification?:string}={})=>{const values={q:q||undefined,role:role||undefined,status:status||undefined,verification:verification||undefined,...next};return Object.entries(values).filter(([,value])=>value).map(([key,value])=>key+"="+encodeURIComponent(String(value))).join("&");};
  return <PageShell eyebrow="Admin Console" title="Users" description="Observe accounts and manage roles, suspensions, bans, and publisher verification." actions={<Link href="/admin" className="btn">Back to admin</Link>}>
    <form method="get" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(150px,1fr))_auto]">
      <Input name="q" defaultValue={q} placeholder="Search name, username or email…" aria-label="Search users"/>
      <Select name="role" defaultValue={role}><option value="">All roles</option><option value="user">User</option><option value="publisher">Publisher</option><option value="admin">Admin</option></Select>
      <Select name="verification" defaultValue={verification}><option value="">All verification</option><option value="verified">Verified</option><option value="unverified">Not verified</option></Select>
      <Select name="status" defaultValue={status}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option></Select>
      <div className="flex gap-2"><button className="min-h-11 flex-1 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800 md:flex-none" type="submit">Filter</button><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50" href="/admin/users">Reset</Link></div>
    </form>
    <div className="my-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3"><strong className="text-sm font-black text-slate-900">{users.length} accounts shown</strong><span className="text-xs font-semibold text-slate-500">Newest first · click a name to inspect posts</span></div>
    <AdminUserTable users={users.map(user=>({_id:String(user._id),name:user.name,username:user.username||null,email:user.email,role:user.role as "user"|"publisher"|"admin",status:user.status as "active"|"suspended"|"banned",isVerified:Boolean(user.isVerified),suspensionUntil:user.suspensionUntil?new Date(user.suspensionUntil):null,suspensionReason:user.suspensionReason,banReason:user.banReason,createdAt:user.createdAt?new Date(user.createdAt):undefined}))} currentAdminId={session.user.id}/>
  </PageShell>;
}
