import Link from "next/link";
import PageShell from "@/components/page-shell";
import WallpaperCard from "@/components/wallpaper-card";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";

export const dynamic="force-dynamic";

type SearchParams={q?:string;category?:string;sort?:string};

function escapeRegex(value:string){return value.replace(/[.*+?^{}()|[\]\\]/g,"\\$&");}

const SORTS=[
  ["newest","Newest"],
  ["title-asc","Title A–Z"],
  ["title-desc","Title Z–A"],
  ["likes","Most liked"],
  ["downloads","Most downloaded"]
] as const;

export default async function ItemsPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const params=await searchParams;
  const q=(params.q||"").trim();
  const category=(params.category||"").trim();
  const sort=SORTS.some(([value])=>value===params.sort)?params.sort||"newest":"newest";

  await connectDB();
  await autoPublishDueWallpapers();

  const filter:Record<string,unknown>={status:"published"};
  if(category&&category!=="All")filter.category=category;
  if(q){
    const regex={$regex:escapeRegex(q),$options:"i"};
    filter.$or=[{title:regex},{category:regex},{tags:regex}];
  }

  const sortMap:Record<string,Record<string,1|-1>>={
    newest:{publishedAt:-1,createdAt:-1},
    "title-asc":{title:1},
    "title-desc":{title:-1},
    likes:{likeCount:-1,publishedAt:-1},
    downloads:{downloadCount:-1,publishedAt:-1}
  };

  const [wallpapers,categories]=await Promise.all([
    Wallpaper.find(filter).sort(sortMap[sort]).limit(60).lean(),
    Wallpaper.distinct("category",{status:"published"})
  ]);

  const query=(extra:Record<string,string|undefined>={})=>{
    const values={q:q||undefined,category:category||undefined,sort:sort!=="newest"?sort:undefined,...extra};
    return Object.entries(values).filter(([,value])=>value).map(([key,value])=>key+"="+encodeURIComponent(String(value))).join("&");
  };

  return <PageShell eyebrow="Discover" title="Wallpapers" description="Browse wallpapers by category, title, popularity and download activity.">
    <form method="get" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
      <input name="q" defaultValue={q} placeholder="Search by title, category or tag…" aria-label="Search wallpapers" className="theme-input" />
      {category?<input type="hidden" name="category" value={category}/>:null}
      <input type="hidden" name="sort" value={sort}/>
      <button className="btn btn-primary" type="submit">Search</button>
      {q||category||sort!=="newest"?<Link className="btn" href="/items">Clear</Link>:null}
    </form>

    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
      <span className="muted" style={{fontSize:13,fontWeight:700}}>Category</span>
      <Link className={!category?"btn btn-primary":"btn"} href={query({category:undefined})?"/items?"+query({category:undefined}):"/items"}>All</Link>
      {categories.sort().map(x=><Link className={category===x?"btn btn-primary":"btn"} href={"/items?"+query({category:x})} key={x}>{x}</Link>)}
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <p className="muted" style={{margin:0}}>{wallpapers.length} wallpapers shown</p>
      <form method="get" style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
        {q?<input type="hidden" name="q" value={q}/>:null}
        {category?<input type="hidden" name="category" value={category}/>:null}
        <label className="muted" htmlFor="wallpaper-sort">Sort</label>
        <select id="wallpaper-sort" name="sort" defaultValue={sort} className="theme-select">
          {SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
        <button className="btn" type="submit">Apply</button>
      </form>
    </div>

    {wallpapers.length===0
      ? <div className="card empty-state"><h2>No published wallpapers found</h2><p className="muted">Try another title, category or sort.</p></div>
      : <div className="wallpaper-grid">{wallpapers.map(item=>{
          const device=item.devices?.[0]||"desktop";
          const imageKey=item.variants?.[device as "desktop"|"tablet"|"mobile"]?.key;
          return <WallpaperCard
            key={String(item._id)}
            slug={item.slug}
            title={item.title}
            category={item.category}
            likes={item.likeCount}
            downloads={item.downloadCount}
            imageUrl={imageKey?signedMediaUrl(imageKey):undefined}
            devices={item.devices||["desktop"]}
            publishedAt={item.publishedAt?new Date(item.publishedAt).toISOString():null}
          />;
        })}</div>}
  </PageShell>;
}
