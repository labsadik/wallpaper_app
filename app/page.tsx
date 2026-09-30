import Link from "next/link";
import Image from "next/image";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import PublishedAt from "@/components/published-at";
import {getPreferredWallpaperDevice} from "@/lib/wallpaper-devices";

export const dynamic="force-dynamic";

export default async function HomePage(){
  await connectDB();
  await autoPublishDueWallpapers();
  const items=await Wallpaper.find({status:"published"})
    .sort({publishedAt:-1,createdAt:-1})
    .limit(8)
    .select("slug title category devices variants publishedAt")
    .lean();

  return <div className="landing-shell">
    <main>
      <section className="landing-hero">
        <div className="container">
          <span className="landing-kicker">Wallpaper SaaS</span>
          <h1>High-quality wallpapers, ready for every screen.</h1>
          <p>Explore polished wallpapers, share them instantly, and publish your own with automatic processing and 20-second publishing.</p>
          <div className="landing-actions">
            <Link className="landing-primary" href="/items">Explore wallpapers</Link>
            <Link className="landing-secondary" href="/register">Create account</Link>
          </div>
          <div className="landing-stat-row">
            <span>Latest published items</span>
            <span>PC · Tablet · Mobile</span>
            <span>No login required to browse or share</span>
          </div>
        </div>
      </section>

      <section className="container landing-items">
        <div className="landing-section-head">
          <div>
            <span className="landing-kicker">Latest collection</span>
            <h2>Published wallpapers</h2>
            <p>Every item is live from the database and can be opened, viewed and shared.</p>
          </div>
          <Link className="landing-secondary" href="/items">View all</Link>
        </div>

        {items.length===0
          ? <div className="landing-empty">
              <strong>No published wallpapers yet.</strong>
              <span>Upload a wallpaper from Publisher Studio and it will publish automatically 20 seconds after processing.</span>
            </div>
          : <div className="landing-grid">
              {items.map(item=>{const device=getPreferredWallpaperDevice(item.devices);return <Link key={String(item._id)} href={"/wallpapers/"+item.slug} className="landing-wallpaper-card">
                <div className="landing-image">
                  {item.variants?.[device]?.key
                    ? <Image
                        className="protected-image"
                        draggable={false}
                        src={signedMediaUrl(item.variants?.[device]?.key||"")}
                        alt={item.title}
                        fill
                        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw"
                        unoptimized
                        style={{objectFit:"cover"}}
                      />
                    : null}
                </div>
                <div className="landing-card-body">
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    <span className="landing-badge">{item.category}</span>
                    {(item.devices||[]).map((device:string)=><span className="landing-badge" key={device}>{device==="desktop"?"PC":device==="tablet"?"Tablet":"Mobile"}</span>)}
                  </div>
                  <h3>{item.title}</h3>
                  <PublishedAt value={item.publishedAt?new Date(item.publishedAt).toISOString():null}/>
                  <span>Open & share →</span>
                </div>
              </Link>})}
            </div>}
      </section>
    </main>
  </div>;
}
