import {NextResponse} from "next/server";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import {analyzeAndOptimize,slugify} from "@/lib/images";
import {uploadToBunny} from "@/lib/bunny";

export const runtime="nodejs";

export async function POST(request:Request){
  const session=await getActiveSession();
  if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
  await connectDB();
  const user=await User.findById(session.user.id).lean();
  if(!user||!["publisher","admin"].includes(user.role)) return NextResponse.json({error:"Publisher access required"},{status:403});

  const form=await request.formData();
  const file=form.get("file");
  const title=String(form.get("title")||"");
  const category=String(form.get("category")||"General").trim();
  const rawDevices=String(form.get("devices")||"desktop,tablet,mobile");
  const devices=rawDevices.split(",").map(value=>value.trim()).filter(Boolean);
  const allowedDevices=["desktop","tablet","mobile"] as const;
  const selectedDevices=[...new Set(devices)].filter((value):value is typeof allowedDevices[number] =>
    (allowedDevices as readonly string[]).includes(value)
  );
  if(!selectedDevices.length) return NextResponse.json({error:"Select at least one target device."},{status:400});
  if(!(file instanceof File)) return NextResponse.json({error:"Image file is required"},{status:400});
  const maxBytes=Number(process.env.MAX_UPLOAD_SIZE_MB||25)*1024*1024;
  if(file.size>maxBytes) return NextResponse.json({error:"File exceeds upload limit"},{status:413});
  if(!title.trim()) return NextResponse.json({error:"Title is required"},{status:400});
  if(!category) return NextResponse.json({error:"Category is required"},{status:400});

  const buffer=Buffer.from(await file.arrayBuffer());
  try{
    const processed=await analyzeAndOptimize(buffer);
    const duplicate=await Wallpaper.exists({"source.sha256":processed.analysis.sha256});
    if(duplicate) return NextResponse.json({error:"Duplicate wallpaper already exists"},{status:409});

    const base=Date.now()+"-"+processed.analysis.sha256.slice(0,12);
    const variants=[
      ["desktop",processed.variants.desktop],
      ["tablet",processed.variants.tablet],
      ["mobile",processed.variants.mobile],
      ["thumbnail",processed.variants.thumbnail]
    ] as const;

    const variantsToUpload=variants.filter(([name]) =>
      name==="thumbnail" || selectedDevices.includes(name as typeof allowedDevices[number])
    );
    const variantMeta:any={};
    for(const [name,data] of variantsToUpload){
      const key="wallpapers/"+name+"/"+base+".webp";
      await uploadToBunny(key,data,"image/webp");
      variantMeta[name]={key,sizeBytes:data.length,mimeType:"image/webp"};
    }
    const sourceKey="wallpapers/original/"+base+"."+processed.analysis.format;
    await uploadToBunny(sourceKey,buffer,file.type||"application/octet-stream");
    const slugBase=slugify(title)||"wallpaper";
    let slug=slugBase; let suffix=1;
    while(await Wallpaper.exists({slug})) slug=slugBase+"-"+suffix++;
    const created=await Wallpaper.create({
      title:title.trim(),slug,category,publisherId:user._id,devices:selectedDevices,
      status:"pending_review",qualityStatus:processed.analysis.qualityStatus,duplicateStatus:"unique",
      source:{width:processed.analysis.width,height:processed.analysis.height,sizeBytes:buffer.length,mimeType:file.type,sha256:processed.analysis.sha256},
      variants:{...variantMeta}
    });
    return NextResponse.json({
      ok:true,
      wallpaperId:String(created._id),
      slug:created.slug,
      category:created.category,
      devices:created.devices
    },{status:201});
  }catch(error){
    const message=error instanceof Error?error.message:"Processing failed";
    return NextResponse.json({error:message},{status:400});
  }
}