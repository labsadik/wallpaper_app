import sharp from "sharp";
import crypto from "node:crypto";

export type ImageAnalysis={
  width:number;height:number;format:string;sizeBytes:number;sha256:string;qualityStatus:"pass"|"warning"|"fail";
};

const allowed=new Set(["jpeg","png","webp","avif"]);

export async function analyzeAndOptimize(buffer:Buffer):Promise<{
  analysis:ImageAnalysis;
  variants:{desktop:Buffer;tablet:Buffer;mobile:Buffer;thumbnail:Buffer};
}>{
  const meta=await sharp(buffer,{failOn:"error"}).metadata();
  const width=meta.width??0;
  const height=meta.height??0;
  const format=meta.format??"";
  if(!allowed.has(format)) throw new Error("Unsupported image format");
  if(width<1280||height<720) throw new Error("Image resolution is too low for wallpaper publishing");

  const qualityStatus=width>=1920&&height>=1080?"pass":"warning";
  const desktop=await sharp(buffer).rotate().resize({width:2560,height:2560,fit:"inside",withoutEnlargement:true}).webp({quality:Number(process.env.IMAGE_QUALITY_WEBP||90),smartSubsample:true}).toBuffer();
  const tablet=await sharp(buffer).rotate().resize({width:2048,height:2048,fit:"inside",withoutEnlargement:true}).webp({quality:Number(process.env.IMAGE_QUALITY_WEBP||90),smartSubsample:true}).toBuffer();
  const mobile=await sharp(buffer).rotate().resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true}).webp({quality:Number(process.env.IMAGE_QUALITY_WEBP||90),smartSubsample:true}).toBuffer();
  const thumbnail=await sharp(buffer).rotate().resize({width:640,height:640,fit:"inside",withoutEnlargement:true}).webp({quality:88}).toBuffer();
  return {
    analysis:{width,height,format,sizeBytes:buffer.length,sha256:crypto.createHash("sha256").update(buffer).digest("hex"),qualityStatus},
    variants:{desktop,tablet,mobile,thumbnail}
  };
}

export function slugify(value:string){
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,120);
}