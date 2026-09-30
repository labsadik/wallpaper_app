import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";
import {getActiveSession} from "@/lib/admin";
import {bunnySignedUrl} from "@/lib/bunny";
import {verifyMediaSignature} from "@/lib/media";

export const runtime="nodejs";

export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}){
  const resolved=await params;
  const segments=(resolved.path||[]).filter(Boolean);
  const path="/"+segments.join("/");
  const storagePath=path.replace(/^//,"");
  const url=new URL(request.url);
  const expires=Number(url.searchParams.get("e")||0);
  const token=url.searchParams.get("s")||"";

  if(!verifyMediaSignature(path,expires,token)){
    return NextResponse.json({error:"Expired or invalid media URL."},{status:403});
  }

  await connectDB();

  const wallpaper=await Wallpaper.findOne({
    $or:[
      {"variants.desktop.key":storagePath},
      {"variants.tablet.key":storagePath},
      {"variants.mobile.key":storagePath},
    ]
  }).select("publisherId status").lean();

  let status:"public"|"private"="public";
  if(wallpaper){
    status=wallpaper.status==="published"?"public":"private";
    if(status==="private"){
      const session=await getActiveSession();
      const isOwner=session?.user?.id&&String(wallpaper.publisherId)===session.user.id;
      const isAdmin=session?.user?.role==="admin";
      if(!isOwner&&!isAdmin)return NextResponse.json({error:"Media is not public."},{status:404});
    }
  }else{
    const avatar=await User.findOne({avatarKey:storagePath}).select("status role").lean();
    if(!avatar)return NextResponse.json({error:"Media not found."},{status:404});
    status="public";
  }

  try{
    const sourceUrl=bunnySignedUrl(storagePath,90);
    const upstream=await fetch(sourceUrl,{cache:"no-store"});
    if(!upstream.ok)return NextResponse.json({error:"Media unavailable."},{status:upstream.status===404?404:502});

    const headers=new Headers();
    headers.set("Content-Type",upstream.headers.get("content-type")||"image/webp");
    headers.set("Cache-Control",status==="public"?"public, max-age=60, stale-while-revalidate=300":"private, no-store");
    headers.set("X-Content-Type-Options","nosniff");
    headers.set("Content-Disposition","inline");
    return new Response(upstream.body,{status:200,headers});
  }catch{
    return NextResponse.json({error:"Media delivery failed."},{status:502});
  }
}
