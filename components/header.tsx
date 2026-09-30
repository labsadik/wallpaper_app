import Link from "next/link";
import type { Session } from "next-auth";

export default function Header({session}:{session:Session|null}){
  const role=session?.user?.role;
  return <header style={{borderBottom:"1px solid var(--line)"}}>
    <div className="container" style={{height:68,display:"flex",alignItems:"center",justifyContent:"space-between",gap:18}}>
      <Link href="/" style={{fontWeight:800,fontSize:20}}>Wallpaper</Link>
      <nav style={{display:"flex",alignItems:"center",gap:16}}>
        <Link href="/wallpapers" className="muted">Wallpapers</Link>
        {role==="publisher"||role==="admin"?<Link href="/publisher" className="muted">Publisher</Link>:null}
        {role==="admin"?<Link href="/admin" className="muted">Admin</Link>:null}
        {session?<Link href="/account" className="btn">Account</Link>:<Link href="/login" className="btn">Login</Link>}
      </nav>
    </div>
  </header>;
}