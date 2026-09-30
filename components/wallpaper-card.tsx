import Link from "next/link";
import Image from "next/image";
import ShareButton from "@/components/share-button";
import PublishedAt from "@/components/published-at";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export default function WallpaperCard({
  slug,title,category,likes=0,downloads=0,imageUrl,devices=[],publishedAt,imageWidth,imageHeight
}:{
  slug:string;
  title:string;
  category:string;
  likes?:number;
  downloads?:number;
  imageUrl?:string;
  devices?:string[];
  publishedAt?:string|Date|null;
  imageWidth?:number;
  imageHeight?:number;
}){
  const width=Math.max(1,imageWidth||16);
  const height=Math.max(1,imageHeight||10);

  return <article className="card wallpaper-card">
    <Link href={"/wallpapers/"+slug} className="wallpaper-card-media">
      <div className="wallpaper-card-image" style={{aspectRatio:width/height,backgroundImage:imageUrl?undefined:"linear-gradient(135deg,#eef2f7,#cbd5e1)"}}>
        {imageUrl
          ? <Image
              className="protected-image"
              src={imageUrl}
              alt={title}
              width={width}
              height={height}
              draggable={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{display:"block",width:"100%",height:"auto"}}
              unoptimized
            />
          : null}
        <div className="wallpaper-card-overlay">
          <span className="badge">{category}</span>
          <div className="wallpaper-card-devices">
            {devices.map(device=><span className="badge" key={device}>{DEVICE_LABELS[device]||device}</span>)}
          </div>
        </div>
      </div>
    </Link>
    <div className="wallpaper-card-body">
      <Link href={"/wallpapers/"+slug}><h3>{title}</h3></Link>
      <PublishedAt value={publishedAt}/>
      <div className="wallpaper-card-footer">
        <div className="muted wallpaper-metrics"><span>♥ {likes}</span><span>↓ {downloads}</span></div>
        <ShareButton title={title} href={"/wallpapers/"+slug}/>
      </div>
    </div>
  </article>;
}
