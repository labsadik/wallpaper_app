import Wallpaper from "@/models/Wallpaper";

const AUTO_PUBLISH_DELAY_MS=20_000;

export function getAutoPublishAt(){
  return new Date(Date.now()+AUTO_PUBLISH_DELAY_MS);
}

export async function autoPublishDueWallpapers(){
  const now=new Date();

  // Backfill legacy pending uploads that were created before publishAt existed.
  // Mongoose 9 rejects updateMany() pipeline arrays unless updatePipeline is enabled.
  const legacy=await Wallpaper.find({
    status:"pending_review",
    publishAt:{$exists:false}
  }).select("_id createdAt").lean();

  if(legacy.length){
    await Wallpaper.bulkWrite(
      legacy.map(item=>({
        updateOne:{
          filter:{_id:item._id,status:"pending_review",publishAt:{$exists:false}},
          update:{
            $set:{
              publishAt:new Date(new Date(item.createdAt).getTime()+AUTO_PUBLISH_DELAY_MS)
            }
          }
        }
      }))
    );
  }

  const result=await Wallpaper.updateMany(
    {
      status:"pending_review",
      publishAt:{$lte:now}
    },
    {
      $set:{
        status:"published",
        publishedAt:now
      },
      $unset:{
        publishAt:1,
        moderationReason:1,
        removedAt:1,
        removedBy:1
      }
    }
  );

  return result.modifiedCount;
}
