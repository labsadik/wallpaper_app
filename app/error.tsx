"use client";

import {useEffect} from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset
}:{
  error:Error&{digest?:string};
  reset:()=>void;
}){
  useEffect(()=>{
    console.error(error);
  },[error]);

  return <main className="container app-error-page">
    <section className="card app-error-card" role="alert">
      <span className="landing-kicker">Something went wrong</span>
      <h1>We could not load this page.</h1>
      <p className="muted">The problem was recorded on the server. You can retry the page or return to the wallpaper collection.</p>
      <div className="app-error-actions">
        <button className="btn btn-primary" type="button" onClick={()=>reset()}>Try again</button>
        <Link className="btn" href="/items">Browse wallpapers</Link>
      </div>
    </section>
  </main>;
}
