import Link from "next/link";

export default function NotFound(){
  return <main className="container app-error-page">
    <section className="card app-error-card">
      <span className="landing-kicker">404</span>
      <h1>Page not found.</h1>
      <p className="muted">That page or wallpaper is not available.</p>
      <div className="app-error-actions">
        <Link className="btn btn-primary" href="/items">Browse wallpapers</Link>
        <Link className="btn" href="/">Go home</Link>
      </div>
    </section>
  </main>;
}
