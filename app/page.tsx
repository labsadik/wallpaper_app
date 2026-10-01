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

  return <main className="min-h-screen bg-white text-slate-950">
    <LandingHero/>
    <LandingAbout/>

    <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20" aria-labelledby="latest-wallpapers">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Visual collection</span>
            <h2 id="latest-wallpapers" className="mt-1 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">Images first. Details when you click.</h2>
          </div>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50" href="/items">View all items</Link>
        </div>

        {items.length===0
          ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center shadow-sm">
              <strong className="block text-sm font-black text-slate-900">No published items yet.</strong>
              <span className="mt-1 block text-sm text-slate-500">Published wallpapers will appear here.</span>
            </div>
          : <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {items.map(item=>{
                const device=getPreferredWallpaperDevice(item.devices);
                const variant=item.variants?.[device];
                const width=Math.max(16,variant?.width||1600);
                const height=Math.max(16,variant?.height||900);
                return <Link
                  key={String(item._id)}
                  href={"/items/"+item.slug}
                  className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
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
                    : <div className="aspect-video w-full bg-slate-100"/>}
                </Link>;
              })}
            </div>}
      </div>
    </section>

    <LandingTestimonials/>
    <LandingFaqs/>
  </main>;
}
