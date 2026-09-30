import Link from "next/link";

export default function LandingHero(){
  return <section className="landing-hero-modern">
    <div className="container landing-hero-modern-inner">
      <span className="landing-kicker">A visual home for wallpapers</span>
      <h1>Discover images that make every screen feel like yours.</h1>
      <p>Wallpaper brings high-quality PC, tablet and mobile artwork into one clean place—published by people, organized by titles, and ready to view, save, share or download.</p>
      <div className="landing-actions">
        <Link className="landing-primary" href="/items">Explore items</Link>
        <Link className="landing-secondary" href="/register">Create profile</Link>
      </div>
      <div className="landing-hero-points">
        <span>Natural image sizes</span>
        <span>Secure media delivery</span>
        <span>Publisher profiles</span>
        <span>Follow & discover</span>
      </div>
    </div>
  </section>;
}
