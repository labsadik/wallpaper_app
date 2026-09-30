import {NextResponse} from "next/server";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import Download from "@/models/Download";
import {bunnySignedUrl} from "@/lib/bunny";

const ALLOWED_DEVICES=["desktop","tablet","mobile"] as const;
type Device=typeof ALLOWED_DEVICES[number];

function isDevice(value:string):value is Device{
  return (ALLOWED_DEVICES as readonly string[]).includes(value);
}

function safeFilename(value:string){
  return value.replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,80)||"wallpaper";
}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const deviceParam=new URL(request.url).searchParams.get("device")||"desktop";
  if(!isDevice(deviceParam))return NextResponse.json({error:"Invalid device."},{status:400});

  const session=await getActiveSession();
  if(!session?.user?.id)return NextResponse.json({error:"Login required to download wallpapers."},{status:401});
  if(session.user.status!=="active"){
    return NextResponse.json({error:"Account is not active."},{status:403});
  }

  await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).lean();
  if(!wallpaper)return NextResponse.json({error:"Wallpaper not found or not published."},{status:404});

  const rawDevices=Array.isArray(wallpaper.devices)?wallpaper.devices as string[]:[];
  const devices=rawDevices.filter(isDevice);
  const device=(devices.includes(deviceParam)?deviceParam:devices[0])||"desktop";
  const key=wallpaper.variants?.[device]?.key;
  if(!key)return NextResponse.json({error:"That device version is not available."},{status:404});

  const url=bunnySignedUrl(key,300);
  await Wallpaper.findByIdAndUpdate(id,{$inc:{downloadCount:1}});
  if(session?.user?.id){
    await Download.create({userId:session.user.id,wallpaperId:wallpaper._id,device});
  }

  return NextResponse.json({
    url,
    device,
    filename:safeFilename(wallpaper.title)+"-"+device+".webp"
  });
}
