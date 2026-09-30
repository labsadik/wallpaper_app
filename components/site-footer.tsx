import Link from "next/link";

export default function SiteFooter(){
  return <footer className="site-footer">
    <div className="container site-footer-grid">
      <div>
        <Link href="/" className="site-footer-brand">Wallpaper</Link>
        <p className="muted">A focused home for high-quality wallpapers, publisher profiles and visual discovery.</p>
      </div>
      <div className="site-footer-links">
        <Link href="/items">Items</Link>
        <Link href="/register">Create account</Link>
        <Link href="/login">Login</Link>
      </div>
    </div>
    <div className="container site-footer-bottom">
      <span>© {new Date().getFullYear()} Wallpaper</span>
      <span>Secure media · Publisher profiles · Visual discovery</span>
    </div>
  </footer>;
}
