import Link from "next/link";
import Image from "next/image";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import {getPreferredWallpaperDevice} from "@/lib/wallpaper-devices";

export const dynamic="force-dynamic";

export default async function HomePage(){
  await connectDB();
  await autoPublishDueWallpapers();
  const items=await Wallpaper.find({status:"published"})
    .sort({publishedAt:-1,createdAt:-1})
    .limit(18)
    .select("slug title devices variants")
    .lean();

  return <main className="container landing-image-home">
    {items.length===0
      ? <div className="landing-empty">
          <strong>No published items yet.</strong>
          <span>Published wallpapers will appear here.</span>
        </div>
      : <div className="landing-image-grid">
          {items.map(item=>{
            const device=getPreferredWallpaperDevice(item.devices);
            const key=item.variants?.[device]?.key;
            return <Link
              key={String(item._id)}
              href={"/wallpapers/"+item.slug}
              className="landing-image-only"
              aria-label={"Open "+item.title}
            >
              <div className="landing-image">
                {key
                  ? <Image
                      className="protected-image"
                      draggable={false}
                      src={signedMediaUrl(key)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      unoptimized
                      style={{objectFit:"cover"}}
                    />
                  : <span className="muted">Image unavailable</span>}
              </div>
            </Link>;
          })}
        </div>}
  </main>;
}
