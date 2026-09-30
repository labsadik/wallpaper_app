export default function WallpapersPage(){
  return <main className="container" style={{padding:"48px 0 80px"}}>
    <h1 style={{fontSize:40,marginBottom:8}}>Wallpapers</h1>
    <p className="muted">The public gallery will read published wallpaper records from MongoDB.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:28}}>
      {Array.from({length:8}).map((_,i)=><div key={i} className="card" style={{minHeight:220,padding:20,display:"flex",alignItems:"flex-end"}}><div><p className="muted">Database-backed slot</p><h3 style={{fontSize:20}}>Wallpaper {i+1}</h3></div></div>)}
    </div>
  </main>;
}