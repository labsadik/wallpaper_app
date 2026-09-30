import Link from "next/link";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import {getPreferredWallpaperDevice} from "@/lib/wallpaper-devices";
import PublishedAt from "@/components/published-at";

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

const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

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
    Wallpaper.find(filter).sort(sortMap[sort]).limit(80).lean(),
    Wallpaper.distinct("category",{status:"published"})
  ]);

  const query=(extra:Record<string,string|undefined>={})=>{
    const values={q:q||undefined,category:category||undefined,sort:sort!=="newest"?sort:undefined,...extra};
    return Object.entries(values).filter(([,value])=>value).map(([key,value])=>key+"="+encodeURIComponent(String(value))).join("&");
  };

  return <main className="items-page">
    <section className="container items-page-head">
      <div className="items-heading">
        <span className="landing-kicker">Discover</span>
        <h1>Find your next wallpaper.</h1>
        <p>Search by title, browse categories, and let the original image proportions create the feed.</p>
      </div>

      <form method="get" className="items-search-form" role="search">
        <span className="items-search-icon" aria-hidden="true">⌕</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title…"
          aria-label="Search wallpapers by title"
          className="items-search-input"
        />
        {category?<input type="hidden" name="category" value={category}/>:null}
        {sort!=="newest"?<input type="hidden" name="sort" value={sort}/>:null}
        <button className="items-search-button" type="submit">Search</button>
      </form>

      <div className="items-toolbar">
        <div className="items-category-scroll" aria-label="Wallpaper categories">
          <Link className={!category?"items-filter is-active":"items-filter"} href={"/items"+(q?"?q="+encodeURIComponent(q):"")}>All</Link>
          {categories.sort().map(item=><Link key={item} className={category===item?"items-filter is-active":"items-filter"} href={"/items?"+query({category:item})}>{item}</Link>)}
        </div>
        <div className="items-toolbar-right">
          <span className="items-results-count">{wallpapers.length} items</span>
          <form method="get" className="items-sort-form">
            {q?<input type="hidden" name="q" value={q}/>:null}
            {category?<input type="hidden" name="category" value={category}/>:null}
            <label htmlFor="items-sort">Sort</label>
            <select id="items-sort" name="sort" defaultValue={sort} className="theme-select">
              {SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
            </select>
            <button className="btn" type="submit">Apply</button>
          </form>
          {q||category||sort!=="newest"?<Link className="btn" href="/items">Clear</Link>:null}
        </div>
      </div>
    </section>

    <section className="container items-feed" aria-label="Wallpaper items">
      {wallpapers.length===0
        ? <div className="card empty-state"><h2>No items found</h2><p className="muted">Try another title, category, or sort order.</p></div>
        : <div className="pinterest-masonry">
            {wallpapers.map(item=>{
              const device=getPreferredWallpaperDevice(item.devices);
              const variant=item.variants?.[device];
              const width=Math.max(16,variant?.width||1600);
              const height=Math.max(16,variant?.height||900);
              return <article className="pinterest-item-card" key={String(item._id)}>
                <Link href={"/wallpapers/"+item.slug} className="pinterest-item-image">
                  {variant?.key
                    ? <img
                        className="protected-image"
                        src={signedMediaUrl(variant.key)}
                        alt={item.title}
                        width={width}
                        height={height}
                        draggable={false}
                      />
                    : <div className="pinterest-image-placeholder"/>}
                  <span className="pinterest-device-chip">{DEVICE_LABELS[device]||device}</span>
                </Link>
                <div className="pinterest-item-meta">
                  <Link href={"/wallpapers/"+item.slug} className="pinterest-item-title">{item.title}</Link>
                  <div className="pinterest-item-line">
                    <span>{item.likeCount||0} likes</span>
                    <span>{item.downloadCount||0} downloads</span>
                    <span>{item.shareCount||0} shares</span>
                  </div>
                  <PublishedAt value={item.publishedAt?new Date(item.publishedAt).toISOString():null}/>
                </div>
              </article>;
            })}
          </div>}
    </section>
  </main>;
}
