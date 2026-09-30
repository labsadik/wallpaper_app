import Link from "next/link";
import PageShell from "@/components/page-shell";
import WallpaperCard from "@/components/wallpaper-card";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {bunnyPublicUrl} from "@/lib/bunny";

export const dynamic="force-dynamic";

type SearchParams={q?:string;category?:string};

function escapeRegex(value:string){
  return value.replace(/[.*+?^{}()|[\]\\]/g,"\\$&");
}

export default async function WallpapersPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const params=await searchParams;
  const q=(params.q||"").trim();
  const category=(params.category||"").trim();

  await connectDB();

  const filter:Record<string,unknown>={status:"published"};
  if(category&&category!=="All") filter.category=category;
  if(q){
    const regex={$regex:escapeRegex(q),$options:"i"};
    filter.$or=[{title:regex},{category:regex},{tags:regex}];
  }

  const [wallpapers,categories]=await Promise.all([
    Wallpaper.find(filter)
      .sort({createdAt:-1})
      .limit(60)
      .lean(),
    Wallpaper.distinct("category",{status:"published"})
  ]);

  return <PageShell eyebrow="Discover" title="Wallpapers" description="Browse published high-resolution wallpapers.">
    <form method="get" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
      <input name="q" defaultValue={q} placeholder="Search wallpapers..." aria-label="Search wallpapers" style={{flex:"1 1 280px",minWidth:220,padding:"11px 13px",borderRadius:12,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      {category?<input type="hidden" name="category" value={category}/>:null}
      <button className="btn btn-primary" type="submit">Search</button>
      {q||category?<Link className="btn" href="/wallpapers">Clear</Link>:null}
    </form>

    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
      <Link className={!category?"btn btn-primary":"btn"} href={q?"/wallpapers?q="+encodeURIComponent(q):"/wallpapers"}>All</Link>
      {categories.sort().map((x)=><Link className={category===x?"btn btn-primary":"btn"} href={"/wallpapers?category="+encodeURIComponent(x)+(q?"&q="+encodeURIComponent(q):"")} key={x}>{x}</Link>)}
    </div>

    {wallpapers.length===0?<div className="card" style={{padding:28}}><h2 style={{margin:"0 0 8px",fontSize:22}}>No published wallpapers found</h2><p className="muted" style={{margin:0}}>Try another search or category.</p></div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}}>
      {wallpapers.map(item=><WallpaperCard
        key={String(item._id)}
        slug={item.slug}
        title={item.title}
        category={item.category}
        likes={item.likeCount}
        downloads={item.downloadCount}
        imageUrl={item.variants?.thumbnail?.key?bunnyPublicUrl(item.variants.thumbnail.key):undefined}
        devices={item.devices||["desktop","tablet","mobile"]}
      />)}
    </div>}
  </PageShell>;
}
