import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import {connectDB} from "@/lib/mongodb";
import {signedMediaUrl} from "@/lib/media";
import WallpaperCard from "@/components/wallpaper-card";
import VerifiedBadge from "@/components/verified-badge";

export const dynamic="force-dynamic";

type Props={params:Promise<{username:string}>};

async function getProfile(username:string){
  await connectDB();
  return User.findOne({
    username:username.toLowerCase(),
    status:"active"
  }).select("name username role isVerified avatarKey createdAt").lean();
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {username}=await params;
  const user=await getProfile(username);
  if(!user)return {};
  const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
  const canonical=base+"/profile/"+user.username;
  return {
    title:(user.name||user.username)+" Profile",
    description:"View "+(user.name||user.username)+"'s published wallpapers.",
    alternates:{canonical},
    openGraph:{type:"profile",title:(user.name||user.username)+" · Wallpaper profile",url:canonical}
  };
}

export default async function PublicProfilePage({params}:Props){
  const {username}=await params;
  const user=await getProfile(username);
  if(!user)notFound();

  const wallpapers=await Wallpaper.find({
    publisherId:user._id,
    status:"published"
  })
    .sort({publishedAt:-1,createdAt:-1})
    .limit(60)
    .select("slug title category devices variants publishedAt likeCount downloadCount")
    .lean();

  const deviceKeys=["desktop","tablet","mobile"] as const;
  const avatarUrl=user.avatarKey?signedMediaUrl(user.avatarKey):null;

  return <main className="container public-profile-page">
    <section className="card public-profile-hero">
      <div className="public-profile-avatar">
        {avatarUrl
          ? <Image className="protected-image" src={avatarUrl} alt="" width={112} height={112} draggable={false} unoptimized/>
          : <span>{(user.name||"U").slice(0,1).toUpperCase()}</span>}
      </div>
      <div className="public-profile-info">
        <div className="public-profile-name-row">
          <h1>{user.name||user.username}</h1>
          {user.role==="publisher"&&user.isVerified?<VerifiedBadge label="Verified publisher"/>:null}
        </div>
        <p className="public-profile-username">@{user.username}</p>
        <div className="public-profile-badges">
          {user.role==="publisher"?<span className="badge">{user.isVerified?"Verified publisher":"Publisher"}</span>:<span className="badge">Member</span>}
          <span className="badge">{wallpapers.length} published</span>
        </div>
        <p className="muted">Public profile · Email and private account details are not shown.</p>
      </div>
    </section>

    <section className="public-profile-section">
      <div className="public-profile-section-head">
        <div>
          <p className="muted" style={{margin:"0 0 4px",fontWeight:700}}>Published collection</p>
          <h2>Wallpapers by @{user.username}</h2>
        </div>
        <Link className="btn" href="/items">Browse all wallpapers</Link>
      </div>

      {wallpapers.length===0
        ? <div className="card empty-state"><h2>No published wallpapers yet</h2><p className="muted">This profile has no public wallpaper posts.</p></div>
        : <div className="wallpaper-grid">
            {wallpapers.map(item=>{
              const device=(item.devices?.[0]||"desktop") as typeof deviceKeys[number];
              const variant=item.variants?.[device];
              return <WallpaperCard
                key={String(item._id)}
                slug={item.slug}
                title={item.title}
                category={item.category}
                likes={item.likeCount}
                downloads={item.downloadCount}
                imageUrl={variant?.key?signedMediaUrl(variant.key):undefined}
                devices={item.devices||["desktop"]}
                publishedAt={item.publishedAt?new Date(item.publishedAt).toISOString():null}
              />;
            })}
          </div>}
    </section>
  </main>;
}
