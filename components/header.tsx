import Link from "next/link";
import Image from "next/image";
import type {Session} from "next-auth";
import LogoutButton from "@/components/logout-button";
import {signedMediaUrl} from "@/lib/media";
import VerifiedBadge from "@/components/verified-badge";

export default function Header({session}:{session:Session|null}){
  const role=session?.user?.role;
  const displayName=session?.user?.name||session?.user?.email||"Account";
  const avatarUrl=session?.user?.avatarKey?signedMediaUrl(session.user.avatarKey):null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-[20px] font-black tracking-[-0.04em] text-slate-950 transition hover:opacity-80">
          Wallpaper
        </Link>

        <nav className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2" aria-label="Primary navigation">
          <Link href="/items" className="inline-flex rounded-lg px-2.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Wallpapers
          </Link>
          {role==="publisher"||role==="admin"?<Link href="/publisher" className="hidden rounded-lg px-2.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex">Publisher</Link>:null}
          {role==="admin"?<Link href="/admin" className="hidden rounded-lg px-2.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:inline-flex">Admin</Link>:null}

          {session ? (
            <div className="ml-1 flex items-center gap-1.5 sm:gap-2">
              <Link
                href={session.user.username?"/profile/"+session.user.username:"/account"}
                className="group inline-flex max-w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2.5 shadow-sm transition hover:border-slate-300 hover:bg-white"
                title={session.user?.email||displayName}
              >
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-xs font-black text-white">
                  {avatarUrl
                    ? <Image src={avatarUrl} alt="" width={32} height={32} className="protected-image size-8 object-cover" unoptimized/>
                    : displayName.slice(0,1).toUpperCase()}
                </span>
                <span className="hidden min-w-0 truncate text-[13px] font-extrabold text-slate-800 sm:inline">{displayName}</span>
                {role==="publisher"&&session.user.isVerified?<VerifiedBadge/>:null}
              </Link>
              <LogoutButton/>
            </div>
          ) : (
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
