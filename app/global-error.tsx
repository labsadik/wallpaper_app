"use client";

import Link from "next/link";

export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <html lang="en">
    <body>
      <main className="container app-error-page">
        <section className="card app-error-card" role="alert">
          <span className="landing-kicker">Service error</span>
          <h1>Wallpaper is temporarily unavailable.</h1>
          <p className="muted">Please retry the page. If the issue continues, try again later.</p>
          <div className="app-error-actions">
            <button className="btn btn-primary" type="button" onClick={()=>reset()}>Try again</button>
            <Link className="btn" href="/">Go home</Link>
          </div>
        </section>
      </main>
    </body>
  </html>;
}
