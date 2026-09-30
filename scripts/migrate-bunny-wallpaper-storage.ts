import "dotenv/config";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {deleteFromBunny,downloadFromBunny,uploadToBunny} from "@/lib/bunny";

const DEVICE_MAP={desktop:"pc",tablet:"tab",mobile:"mobile"} as const;

async function main(){
  await connectDB();
  const rows=await Wallpaper.find({}).lean();
  let migrated=0,skipped=0,failed=0;

  for(const row of rows){
    const devices=(row.devices||[]).filter((value):value is keyof typeof DEVICE_MAP=>value in DEVICE_MAP);
    const selected=devices[0]||(["desktop","tablet","mobile"] as const).find(device=>Boolean(row.variants?.[device]?.key));
    if(!selected||!row.variants?.[selected]?.key){
      skipped++;
      continue;
    }

    const oldKeys=[row.variants.desktop?.key,row.variants.tablet?.key,row.variants.mobile?.key,row.variants.thumbnail?.key].filter((key):key is string=>Boolean(key));
    const oldKey=row.variants[selected]!.key;
    const filename=oldKey.split("/").pop()||String(row._id)+".webp";
    const newKey=`feature_wallpapers/${DEVICE_MAP[selected]}/${filename}`;

    try{
      let data:Buffer;
      if(oldKey===newKey){
        skipped++;
        continue;
      }
      data=await downloadFromBunny(oldKey);
      await uploadToBunny(newKey,data,"image/webp");

      await Wallpaper.updateOne({_id:row._id},{
        $set:{devices:[selected],variants:{[selected]:{
          key:newKey,
          width:row.variants[selected]?.width||row.source?.width,
          height:row.variants[selected]?.height||row.source?.height,
          sizeBytes:data.length,
          mimeType:"image/webp"
        }}},
        $unset:{"variants.thumbnail":1,"variants.desktop":1,"variants.tablet":1,"variants.mobile":1}
      });
      await Wallpaper.updateOne({_id:row._id},{$set:{[`variants.${selected}`]:{
        key:newKey,
        width:row.variants[selected]?.width||row.source?.width,
        height:row.variants[selected]?.height||row.source?.height,
        sizeBytes:data.length,
        mimeType:"image/webp"
      }}});

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
