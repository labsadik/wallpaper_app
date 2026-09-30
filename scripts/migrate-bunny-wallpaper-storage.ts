import "dotenv/config";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {deleteFromBunny,downloadFromBunny,uploadToBunny} from "@/lib/bunny";

const DEVICE_MAP={desktop:"pc",tablet:"tab",mobile:"mobile"} as const;
type Device=keyof typeof DEVICE_MAP;

async function main(){
  await connectDB();
  const rows=await Wallpaper.find({}).lean();
  let migrated=0,skipped=0,failed=0;

  for(const row of rows){
    const variants=(row.variants||{}) as Record<string,{key?:string;width?:number;height?:number}|undefined>;
    const devices=(row.devices||[]).filter((value):value is Device=>value==="desktop"||value==="tablet"||value==="mobile");
    const selected=devices[0]||(["desktop","tablet","mobile"] as const).find(device=>Boolean(variants[device]?.key));

    if(!selected||!variants[selected]?.key){
      skipped++;
      continue;
    }

    const oldKey=variants[selected]!.key!;
    const oldKeys=[variants.desktop?.key,variants.tablet?.key,variants.mobile?.key,variants.thumbnail?.key]
      .filter((key):key is string=>Boolean(key));
    const filename=oldKey.split("/").pop()||String(row._id)+".webp";
    const newKey="feature_wallpapers/"+DEVICE_MAP[selected]+"/"+filename;

    try{
      if(oldKey===newKey){
        skipped++;
        continue;
      }

      const data=await downloadFromBunny(oldKey);
      await uploadToBunny(newKey,data,"image/webp");

      const metadata={
        key:newKey,
        width:variants[selected]?.width||row.source?.width,
        height:variants[selected]?.height||row.source?.height,
        sizeBytes:data.length,
        mimeType:"image/webp"
      };

      const unset:Record<string,1>={};
      for(const key of ["desktop","tablet","mobile","thumbnail"]){
        unset["variants."+key]=1;
      }
      delete unset["variants."+selected];

      await Wallpaper.updateOne(
        {_id:row._id},
        {
          $set:{devices:[selected],[\`variants.\${selected}\`]:metadata},
          $unset:unset
        }
      );

      for(const key of oldKeys){
        if(key!==newKey)await deleteFromBunny(key).catch(()=>{});
      }

      migrated++;
      console.log("migrated",String(row._id),oldKey,"->",newKey);
    }catch(error){
      failed++;
      console.error("failed",String(row._id),error instanceof Error?error.message:error);
    }
  }

  console.log({migrated,skipped,failed});
  process.exitCode=failed?1:0;
}

void main();
