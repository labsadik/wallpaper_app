import Link from "next/link";

export default function WallpaperCard({slug,title,category,likes=0,downloads=0,imageUrl}:{slug:string;title:string;category:string;likes?:number;downloads?:number;imageUrl?:string}){
  return <article className="card" style={{overflow:"hidden",background:"#0f141c"}}>
    <Link href={"/wallpapers/"+slug} style={{display:"block"}}>
      <div style={{aspectRatio:"16/10",background:imageUrl?"#06090f":"linear-gradient(135deg,#1b2432,#394760 45%,#10141b)",position:"relative"}}>
        {imageUrl?<img src={imageUrl} alt={title} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>:null}
        <div style={{position:"absolute",inset:"auto 10px 10px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{padding:"6px 9px",borderRadius:999,background:"rgba(0,0,0,.45)",backdropFilter:"blur(8px)",fontSize:12}}>{category}</span>
        </div>
      </div>
    </Link>
    <div style={{padding:16}}>
      <Link href={"/wallpapers/"+slug}><h3 style={{margin:"0 0 9px",fontSize:18}}>{title}</h3></Link>
      <div className="muted" style={{display:"flex",gap:14,fontSize:13}}><span>♥ {likes}</span><span>↓ {downloads}</span><span>↗ Share</span></div>
    </div>
  </article>;
}
