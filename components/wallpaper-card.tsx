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

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]">
      <Link href={"/items/"+slug} className="block">
        <div className="relative overflow-hidden bg-slate-100" style={{aspectRatio:width/height}}>
          {imageUrl
            ? <Image
                className="protected-image block h-auto w-full transition duration-300 group-hover:scale-[1.012]"
                src={imageUrl}
                alt={title}
                width={width}
                height={height}
                draggable={false}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            : <div className="aspect-video w-full bg-[linear-gradient(135deg,#eef2f7,#cbd5e1)]"/>}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <span className="rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 shadow-sm backdrop-blur">
              {category}
            </span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {devices.map(device=>(
                <span className="rounded-full border border-white/70 bg-slate-900/85 px-2 py-1 text-[10px] font-extrabold text-white shadow-sm backdrop-blur" key={device}>
                  {DEVICE_LABELS[device]||device}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={"/items/"+slug} className="block min-w-0">
          <h3 className="truncate text-[17px] font-black tracking-[-0.02em] text-slate-950 transition group-hover:text-slate-700 sm:text-lg">
            {title}
          </h3>
        </Link>
        <div className="mt-1.5"><PublishedAt value={publishedAt}/></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span>♥ {likes}</span>
            <span>↓ {downloads}</span>
          </div>
          <ShareButton title={title} href={"/items/"+slug}/>
        </div>
      </div>
    </article>
  );
}
