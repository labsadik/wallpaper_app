import PageShell from "@/components/page-shell";
import WallpaperCard from "@/components/wallpaper-card";

const demo=[
  {slug:"misty-mountain-sunrise",title:"Misty Mountain Sunrise",category:"Nature",likes:1245,downloads:8431},
  {slug:"midnight-city",title:"Midnight City",category:"Urban",likes:982,downloads:7310},
  {slug:"deep-space",title:"Deep Space",category:"Space",likes:2140,downloads:12680},
  {slug:"minimal-lines",title:"Minimal Lines",category:"Minimal",likes:642,downloads:3987},
  {slug:"ocean-blue",title:"Ocean Blue",category:"Nature",likes:890,downloads:5641},
  {slug:"dark-geometry",title:"Dark Geometry",category:"Abstract",likes:731,downloads:4814},
];

export default function WallpapersPage(){
  return <PageShell eyebrow="Discover" title="Wallpapers" description="Browse high-resolution wallpapers. Like, save, share and download your favorites.">
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
      {["All","Nature","Abstract","Urban","Space","Minimal","Cars","Gaming"].map((x,i)=><button className={i===0?"btn btn-primary":"btn"} key={x}>{x}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}}>
      {demo.map(item=><WallpaperCard key={item.slug} {...item}/>)}
    </div>
  </PageShell>;
}