import Link from "next/link";

const COPYRIGHT_YEAR=new Date().getFullYear();

export default function SiteFooter(){
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-start lg:px-8">
        <div className="max-w-xl">
          <Link href="/" className="text-lg font-black tracking-[-0.03em] text-slate-950">Wallpaper</Link>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            A focused home for high-quality wallpapers, publisher profiles and visual discovery.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600" aria-label="Footer navigation">
          <Link href="/items" className="transition hover:text-slate-950">Items</Link>
          <Link href="/register" className="transition hover:text-slate-950">Create account</Link>
          <Link href="/login" className="transition hover:text-slate-950">Login</Link>
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 border-t border-slate-100 px-5 py-5 text-xs font-semibold text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>© {COPYRIGHT_YEAR} Wallpaper</span>
        <span>Secure media · Publisher profiles · Visual discovery</span>
      </div>
    </footer>
  );
}
