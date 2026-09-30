import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {getActiveSession} from "@/lib/admin";
import User from "@/models/User";
import Follow from "@/models/Follow";

type Params={params:Promise<{username:string}>};

export async function POST(request:Request,{params}:Params){
  void request;
  const session=await getActiveSession();
  if(!session)return NextResponse.json({error:"Login required."},{status:401});

  const {username}=await params;
  await connectDB();

  const target=await User.findOne({username:username.toLowerCase(),status:"active"}).select("_id username");
  if(!target)return NextResponse.json({error:"Profile not found."},{status:404});

  const followerId=session.user.id;
  const followingId=String(target._id);
  if(followerId===followingId)return NextResponse.json({error:"You cannot follow your own profile."},{status:400});

  const existing=await Follow.findOne({followerId,followingId}).select("_id").lean();
  if(existing){
    await Follow.deleteOne({_id:existing._id});
    const [followers,following]=await Promise.all([
      Follow.countDocuments({followingId}),
      Follow.countDocuments({followerId})
    ]);
    return NextResponse.json({following:false,followers,followingCount:following});
  }

  try{
    await Follow.create({followerId,followingId});
  }catch(error){
    const duplicate=error instanceof Error && /duplicate key|E11000/i.test(error.message);
    if(!duplicate)throw error;
  }

  const [followers,following]=await Promise.all([
    Follow.countDocuments({followingId}),
    Follow.countDocuments({followerId})
  ]);

  return NextResponse.json({following:true,followers,followingCount:following});
}

export async function GET(request:Request,{params}:Params){
  void request;
  const session=await getActiveSession();
  const {username}=await params;
  await connectDB();

  const target=await User.findOne({username:username.toLowerCase(),status:"active"}).select("_id username");
  if(!target)return NextResponse.json({error:"Profile not found."},{status:404});

  const followingId=String(target._id);
  const [followers,followingCount,viewerFollowing]=await Promise.all([
    Follow.countDocuments({followingId}),
    Follow.countDocuments({followerId:followingId}),
    session&&session.user.id!==followingId
      ? Follow.exists({followerId:session.user.id,followingId})
      : Promise.resolve(false)
  ]);

  return NextResponse.json({
    following:Boolean(viewerFollowing),
    isSelf:Boolean(session?.user?.id===followingId),
    followers,
    followingCount
  });
}
