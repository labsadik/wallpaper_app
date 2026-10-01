import Link from "next/link";
import Image from "next/image";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";
import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";
import {getPreferredWallpaperDevice} from "@/lib/wallpaper-devices";
import PublishedAt from "@/components/published-at";

export const dynamic="force-dynamic";
type SearchParams={q?:string;category?:string;sort?:string};
function escapeRegex(value:string){return value.replace(/[.*+?^{}()|[]\]/g,"\$&");}
const SORTS=[["newest","Newest"],["title-asc","Title A–Z"],["title-desc","Title Z–A"],["likes","Most liked"],["downloads","Most downloaded"]] as const;
const DEVICE_LABELS:Record<string,string>={desktop:"PC",tablet:"Tablet",mobile:"Mobile"};

export default async function ItemsPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const params=await searchParams,q=(params.q||"").trim(),category=(params.category||"").trim(),sort=SORTS.some(([value])=>value===params.sort)?params.sort||"newest":"newest";
  await connectDB();await autoPublishDueWallpapers();
  const filter:Record<string,unknown>={status:"published"};if(category&&category!=="All")filter.category=category;if(q){const regex={$regex:escapeRegex(q),$options:"i"};filter.$or=[{title:regex},{category:regex},{tags:regex}];}
  const sortMap:Record<string,Record<string,1|-1>>={newest:{publishedAt:-1,createdAt:-1},"title-asc":{title:1},"title-desc":{title:-1},likes:{likeCount:-1,publishedAt:-1},downloads:{downloadCount:-1,publishedAt:-1}};
  const [wallpapers,categories]=await Promise.all([Wallpaper.find(filter).sort(sortMap[sort]).limit(80).lean(),Wallpaper.distinct("category",{status:"published"})]);
  const query=(extra:Record<string,string|undefined>={})=>{const values={q:q||undefined,category:category||undefined,sort:sort!=="newest"?sort:undefined,...extra};return Object.entries(values).filter(([,value])=>value).map(([key,value])=>key+"="+encodeURIComponent(String(value))).join("&");};

  return <main className="min-h-screen pb-20 pt-8 sm:pt-10">
    <section className="mx-auto w-full max-w-[1180px] px-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-slate-200/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Discover</p><h1 className="mt-2 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl">Find your next wallpaper.</h1><p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500">Search by title, browse categories, and let each image keep its natural proportions.</p></div>
        <form method="get" className="flex w-full max-w-xl gap-2" role="search"><div className="relative min-w-0 flex-1"><span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-xl text-slate-400">⌕</span><input name="q" defaultValue={q} placeholder="Search by title, category or tag…" aria-label="Search wallpapers" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"/>{category?<input type="hidden" name="category" value={category}/>:null}{sort!=="newest"?<input type="hidden" name="sort" value={sort}/>:null}</div><button className="min-h-11 shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800" type="submit">Search</button></form>
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-0.5" aria-label="Wallpaper categories"><Link className={!category?"shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white":"shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"} href={"/items"+(q?"?q="+encodeURIComponent(q):"")}>All</Link>{categories.sort().map(item=><Link key={item} className={category===item?"shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white":"shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"} href={"/items?"+query({category:item})}>{item}</Link>)}</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><span className="whitespace-nowrap text-xs font-bold text-slate-500">{wallpapers.length} items</span><form method="get" className="flex flex-wrap items-center gap-2">{q?<input type="hidden" name="q" value={q}/>:null}{category?<input type="hidden" name="category" value={category}/>:null}<label className="sr-only" htmlFor="items-sort">Sort</label><select id="items-sort" name="sort" defaultValue={sort} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70">{SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="min-h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50" type="submit">Apply</button>{q||category||sort!=="newest"?<Link className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50" href="/items">Clear</Link>:null}</form></div>
      </div>
    </section>

    <section className="mx-auto mt-7 w-full max-w-[1180px] px-5 sm:px-6 lg:px-8" aria-label="Wallpaper items">
      {wallpapers.length===0?<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-xl">⌕</div><h2 className="mt-4 text-xl font-black text-slate-950">No items found</h2><p className="mt-1 text-sm leading-6 text-slate-500">Try another title, category, or sort order.</p><Link className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800" href="/items">View all items</Link></div>
      :<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">{wallpapers.map(item=>{const device=getPreferredWallpaperDevice(item.devices),variant=item.variants?.[device],width=Math.max(16,variant?.width||1600),height=Math.max(16,variant?.height||900);return <article className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg" key={String(item._id)}><Link href={"/items/"+item.slug} className="group relative block overflow-hidden bg-slate-100">{variant?.key?<Image className="protected-image block h-auto w-full transition duration-300 group-hover:scale-[1.012]" src={signedMediaUrl(variant.key)} alt={item.title} width={width} height={height} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized draggable={false}/>:<div className="aspect-video w-full bg-slate-100"/>}<span className="absolute right-3 top-3 rounded-full border border-white/70 bg-slate-900/85 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm backdrop-blur">{DEVICE_LABELS[device]||device}</span></Link><div className="p-3.5"><Link href={"/items/"+item.slug} className="block truncate text-[15px] font-black tracking-[-0.015em] text-slate-950 hover:underline">{item.title}</Link><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500"><span>♥ {item.likeCount||0}</span><span>↓ {item.downloadCount||0}</span><span>↗ {item.shareCount||0}</span></div><div className="mt-1.5"><PublishedAt value={item.publishedAt?new Date(item.publishedAt).toISOString():null}/></div></div></article>;})}</div>}
    </section>
  </main>;
}
