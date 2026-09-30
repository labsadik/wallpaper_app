import Wallpaper from "@/models/Wallpaper";

const AUTO_PUBLISH_DELAY_MS=20_000;

export function getAutoPublishAt(){
  return new Date(Date.now()+AUTO_PUBLISH_DELAY_MS);
}

export async function autoPublishDueWallpapers(){
  const now=new Date();
  await Wallpaper.updateMany(
    {status:"pending_review",publishAt:{$exists:false}},
    [{$set:{publishAt:{$add:["$createdAt",AUTO_PUBLISH_DELAY_MS]}}}]
  );

  const result=await Wallpaper.updateMany(
    {status:"pending_review",publishAt:{$lte:now}},
    {
      $set:{
        status:"published",
        publishedAt:now
      },
      $unset:{
        moderationReason:1,
        removedAt:1,
        removedBy:1
      }
    }
  );

  return result.modifiedCount;
}
