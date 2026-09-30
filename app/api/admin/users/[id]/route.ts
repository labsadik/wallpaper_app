import {NextResponse} from "next/server";
import {z} from "zod";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import {requireAdmin} from "@/lib/admin";

const roleSchema=z.enum(["user","publisher","admin"]);
const actionSchema=z.object({
  action:z.enum(["role","suspend","unsuspend","ban","unban","verify","unverify"]),
  role:roleSchema.optional(),
  duration:z.enum(["1h","24h","7d","30d","permanent"]).optional(),
  reason:z.string().trim().max(500).optional()
});

function durationMs(duration:string){
  const map:Record<string,number>={"1h":60*60*1000,"24h":24*60*60*1000,"7d":7*24*60*60*1000,"30d":30*24*60*60*1000};
  return map[duration]??0;
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await requireAdmin();
  if(auth.unauthorized)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(auth.forbidden)return NextResponse.json({error:"Admin access required"},{status:403});

  const {id}=await params;
  const parsed=actionSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid admin action"},{status:400});

  await connectDB();
  const user=await User.findById(id);
  if(!user)return NextResponse.json({error:"User not found"},{status:404});

  if(String(user._id)===auth.session.user.id && ["suspend","unsuspend","ban","unban"].includes(parsed.data.action)){
    return NextResponse.json({error:"Admins cannot suspend or ban their own account."},{status:400});
  }

  if(parsed.data.action==="verify"||parsed.data.action==="unverify"){
    if(user.role!=="publisher")return NextResponse.json({error:"Only publisher accounts can be verified."},{status:400});
    user.isVerified=parsed.data.action==="verify";
  }

  if(parsed.data.action==="role"){
    if(!parsed.data.role)return NextResponse.json({error:"Role is required"},{status:400});
    if(user.role==="admin"&&parsed.data.role!=="admin"){
      const adminCount=await User.countDocuments({role:"admin",status:{$ne:"banned"}});
      if(adminCount<=1)return NextResponse.json({error:"The last active admin cannot be demoted."},{status:409});
    }
    user.role=parsed.data.role;
    if(user.role!=="publisher")user.isVerified=false;
  }

  if((parsed.data.action==="suspend"||parsed.data.action==="ban")&&user.role==="admin"){
    const activeAdmins=await User.countDocuments({role:"admin",status:"active"});
    if(activeAdmins<=1){
      return NextResponse.json({error:"The last active admin cannot be suspended or banned."},{status:409});
    }
  }

  if(parsed.data.action==="suspend"){
    if(!parsed.data.duration)return NextResponse.json({error:"Suspension duration is required"},{status:400});
    user.status="suspended";
    user.suspensionReason=parsed.data.reason||"Administrative suspension";
    user.suspensionUntil=parsed.data.duration==="permanent"
      ? undefined
      : new Date(Date.now()+durationMs(parsed.data.duration));
  }

  if(parsed.data.action==="unsuspend"){
    user.status="active";
    user.suspensionUntil=undefined;
    user.suspensionReason=undefined;
  }

  if(parsed.data.action==="ban"){
    user.status="banned";
    user.bannedAt=new Date();
    user.banReason=parsed.data.reason||"Administrative ban";
    user.suspensionUntil=undefined;
    user.suspensionReason=undefined;
  }

  if(parsed.data.action==="unban"){
    user.status="active";
    user.bannedAt=undefined;
    user.banReason=undefined;
    user.suspensionUntil=undefined;
    user.suspensionReason=undefined;
  }

  await user.save();

  return NextResponse.json({
    ok:true,
    user:{
      id:String(user._id),
      name:user.name,
      email:user.email,
      role:user.role,
      status:user.status,
      isVerified:Boolean(user.isVerified),
      username:user.username||null,
      avatarKey:user.avatarKey||null,
      suspensionUntil:user.suspensionUntil,
      suspensionReason:user.suspensionReason,
      bannedAt:user.bannedAt,
      banReason:user.banReason
    }
  });
}
