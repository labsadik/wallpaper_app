import Link from "next/link";
import Image from "next/image";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import {getPreferredWallpaperDevice} from "@/lib/wallpaper-devices";
import LandingHero from "@/components/landing-hero";
import LandingAbout from "@/components/landing-about";
import LandingTestimonials from "@/components/landing-testimonials";
import LandingFaqs from "@/components/landing-faqs";

export const dynamic="force-dynamic";

export default async function HomePage(){
  await connectDB();
  await autoPublishDueWallpapers();

  const items=await Wallpaper.find({status:"published"})
    .sort({publishedAt:-1,createdAt:-1})
    .limit(30)
    .select("slug title devices variants")
    .lean();

  return <main className="landing-shell">
    <LandingHero/>
    <LandingAbout/>

    <section className="landing-gallery-section" aria-labelledby="latest-wallpapers">
      <div className="container">
        <div className="landing-gallery-head">
          <div>
            <span className="landing-kicker">Visual collection</span>
            <h2 id="latest-wallpapers">Images first. Details when you click.</h2>
          </div>
          <Link className="landing-secondary" href="/items">View all items</Link>
        </div>

        {items.length===0
          ? <div className="landing-empty">
              <strong>No published items yet.</strong>
              <span>Published wallpapers will appear here.</span>
            </div>
          : <div className="pinterest-masonry landing-masonry">
              {items.map(item=>{
                const device=getPreferredWallpaperDevice(item.devices);
                const variant=item.variants?.[device];
                const width=Math.max(16,variant?.width||1600);
                const height=Math.max(16,variant?.height||900);
                return <Link
                  key={String(item._id)}
                  href={"/wallpapers/"+item.slug}
                  className="pinterest-image-tile"
                  aria-label={"Open "+item.title}
                >
                  {variant?.key
                    ? <Image
                        className="protected-image"
                        draggable={false}
                        src={signedMediaUrl(variant.key)}
                        alt={item.title}
                        width={width}
                        height={height}
                        sizes="(max-width: 700px) 50vw, (max-width: 1050px) 33vw, 20vw"
                        unoptimized
                      />
                    : <div className="pinterest-image-placeholder"/>}
                </Link>;
              })}
            </div>}
      </div>
    </section>

    <LandingTestimonials/>
    <LandingFaqs/>
  </main>;
}
