import {NextResponse} from "next/server";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import {analyzeAndOptimize,slugify} from "@/lib/images";
import {uploadToBunny} from "@/lib/bunny";
import {getAutoPublishAt} from "@/lib/wallpaper-publish";

export const runtime="nodejs";

export async function POST(request:Request){
  const session=await getActiveSession();
  if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});

  await connectDB();
  const user=await User.findById(session.user.id).select("name username role").lean();
  if(!user||!["publisher","admin"].includes(user.role))return NextResponse.json({error:"Publisher access required"},{status:403});

  const form=await request.formData();
  const file=form.get("file");
  const title=String(form.get("title")||"").trim();
  const category=String(form.get("category")||"General").trim();
  const rawDevices=String(form.get("devices")||"");
  const devices=[...new Set(rawDevices.split(",").map(value=>value.trim()).filter(Boolean))];
  const allowedDevices=["desktop","tablet","mobile"] as const;

  if(devices.length!==1||!(allowedDevices as readonly string[]).includes(devices[0])){
    return NextResponse.json({error:"Choose exactly one device: PC, Tablet, or Mobile."},{status:400});
  }
  if(!(file instanceof File))return NextResponse.json({error:"Image file is required"},{status:400});

  const maxBytes=Number(process.env.MAX_UPLOAD_SIZE_MB||25)*1024*1024;
  if(file.size>maxBytes)return NextResponse.json({error:"File exceeds upload limit"},{status:413});
  if(!title)return NextResponse.json({error:"Title is required"},{status:400});
  if(!category)return NextResponse.json({error:"Category is required"},{status:400});

  const buffer=Buffer.from(await file.arrayBuffer());

  try{
    const processed=await analyzeAndOptimize(buffer);
    const duplicate=await Wallpaper.exists({"source.sha256":processed.analysis.sha256});
    if(duplicate)return NextResponse.json({error:"Duplicate wallpaper already exists"},{status:409});

    const selectedDevice=devices[0] as typeof allowedDevices[number];
    const data=processed.variants[selectedDevice];
    const base=Date.now()+"-"+processed.analysis.sha256.slice(0,12);

    const storageDevice=selectedDevice==="desktop"?"pc":selectedDevice==="tablet"?"tab":"mobile";
    const key="feature_wallpapers/"+storageDevice+"/"+base+".webp";
    await uploadToBunny(key,data,"image/webp");

    let username=user.username||slugify(user.name)||"user";
    if(!user.username){
      const baseUsername=username;
      let suffix=1;
      while(await User.exists({username})){
        suffix++;
        username=(baseUsername+"-"+suffix).slice(0,80);
      }
      await User.updateOne({_id:user._id},{$set:{username}});
    }

    const createdAt=new Date();
    const datePart=createdAt.toISOString().slice(0,10);
    const timePart=createdAt.toISOString().slice(11,19).replace(/:/g,"");
    const slugBase=slugify(username+"-"+title+"-"+datePart+"-"+timePart)||("wallpaper-"+datePart+"-"+timePart);
    let slug=slugBase.slice(0,170);
    let suffix=1;
    while(await Wallpaper.exists({slug})){
      suffix++;
      const extra="-"+suffix;
      slug=(slugBase.slice(0,170-extra.length)+extra);
    }

    const variantMeta={
      [selectedDevice]:{
        key,sizeBytes:data.length,mimeType:"image/webp",
        width:processed.analysis.width,height:processed.analysis.height
      }
    };

    const created=await Wallpaper.create({
      title,slug,category,publisherId:user._id,devices:[selectedDevice],
      status:"pending_review",publishAt:getAutoPublishAt(),
      qualityStatus:processed.analysis.qualityStatus,duplicateStatus:"unique",
      source:{width:processed.analysis.width,height:processed.analysis.height,sizeBytes:buffer.length,mimeType:file.type,sha256:processed.analysis.sha256},
      variants:variantMeta
    });

    return NextResponse.json({
      ok:true,
      wallpaperId:String(created._id),
      slug:created.slug,
      category:created.category,
      devices:created.devices,
      status:created.status,
      publishAt:created.publishAt
    },{status:201});
  }catch(error){
    const message=error instanceof Error?error.message:"Processing failed";
    return NextResponse.json({error:message},{status:400});
  }
}
