import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import {requireAdmin} from "@/lib/admin";

export async function GET(request:Request){
  const auth=await requireAdmin();
  if(auth.unauthorized)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(auth.forbidden)return NextResponse.json({error:"Admin access required"},{status:403});

  const {searchParams}=new URL(request.url);
  const q=searchParams.get("q")?.trim()||"";
  const role=searchParams.get("role")||"";
  const status=searchParams.get("status")||"";
  const limit=Math.min(Math.max(Number(searchParams.get("limit")||50),1),100);

  await connectDB();
  const filter:Record<string,unknown>={};
  if(role&&["user","publisher","admin"].includes(role))filter.role=role;
  if(status&&["active","suspended","banned"].includes(status))filter.status=status;
  if(q)filter.$or=[{name:{$regex:q,$options:"i"}},{email:{$regex:q,$options:"i"}}];

  const users=await User.find(filter)
    .select("name email role status suspensionUntil suspensionReason bannedAt banReason createdAt updatedAt")
    .sort({createdAt:-1})
    .limit(limit)
    .lean();

  return NextResponse.json({users});
}
