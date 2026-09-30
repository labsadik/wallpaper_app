import Link from "next/link";
import Image from "next/image";
import ShareButton from "@/components/share-button";

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export default function WallpaperCard({
  slug,title,category,likes=0,downloads=0,imageUrl,devices=[]
}:{
  slug:string;
  title:string;
  category:string;
  likes?:number;
  downloads?:number;
  imageUrl?:string;
  devices?:string[];
}){
  return <article className="card" style={{overflow:"hidden",background:"#0f141c"}}>
    <Link href={"/wallpapers/"+slug} style={{display:"block"}}>
      <div style={{aspectRatio:"16/10",background:imageUrl?"#06090f":"linear-gradient(135deg,#1b2432,#394760 45%,#10141b)",position:"relative"}}>
        {imageUrl?<Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{objectFit:"cover"}} unoptimized/>:null}
        <div style={{position:"absolute",inset:"auto 10px 10px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
          <span className="badge">{category}</span>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {devices.map(device=><span className="badge" key={device}>{DEVICE_LABELS[device]||device}</span>)}
          </div>
        </div>
      </div>
    </Link>
    <div style={{padding:16}}>
      <Link href={"/wallpapers/"+slug}><h3 style={{margin:"0 0 9px",fontSize:18}}>{title}</h3></Link>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <div className="muted" style={{display:"flex",gap:14,fontSize:13}}><span>♥ {likes}</span><span>↓ {downloads}</span></div>
        <ShareButton title={title} href={"/wallpapers/"+slug}/>
      </div>
    </div>
  </article>;
}
