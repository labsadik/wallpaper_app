import Link from "next/link";

const categories=[["Nature","Misty Mountains"],["Urban","Midnight City"],["Space","Deep Space"],["Minimal","Minimal Lines"]];

export default function HomePage(){
  return <main>
    <section className="container" style={{padding:"72px 0 40px"}}>
      <p className="muted">Wallpaper SaaS</p>
      <h1 style={{fontSize:"clamp(42px,7vw,76px)",lineHeight:1.02,maxWidth:900,margin:"12px 0 20px"}}>Discover beautiful wallpapers. Publish once, process automatically.</h1>
      <p className="muted" style={{fontSize:18,maxWidth:720}}>Users can like, save, share and download. Publishers upload once; the platform handles validation, quality checks, optimization and device variants.</p>
      <div style={{display:"flex",gap:12,marginTop:28}}>
        <Link className="btn btn-primary" href="/wallpapers">Explore wallpapers</Link>
        <Link className="btn" href="/register">Create account</Link>
      </div>
    </section>
    <section className="container" style={{padding:"20px 0 80px"}}>
      <h2 style={{fontSize:28,marginBottom:18}}>Featured categories</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
        {categories.map(([category,title])=><Link key={title} href="/wallpapers" className="card" style={{padding:22}}><p className="muted">{category}</p><h3 style={{fontSize:22,margin:"10px 0 0"}}>{title}</h3></Link>)}
      </div>
    </section>
  </main>;
}