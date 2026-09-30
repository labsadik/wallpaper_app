const TESTIMONIALS=[
  {quote:"The feed feels calm and visual. I can scan images first and open the ones that earn a closer look.",name:"Maya R.",role:"Early creator"},
  {quote:"I like that the publisher identity stays connected to every item instead of disappearing behind the image.",name:"Daniel K.",role:"Wallpaper collector"},
  {quote:"The profile view makes publishing feel like a real creative home, not just an upload form.",name:"Aarav S.",role:"Independent publisher"}
] as const;

export default function LandingTestimonials(){
  return <section className="landing-testimonials-section">
    <div className="container">
      <div className="landing-section-intro">
        <span className="landing-kicker">Community</span>
        <h2>Made for people who notice the details.</h2>
      </div>
      <div className="landing-testimonial-grid">
        {TESTIMONIALS.map(item=><article className="landing-testimonial" key={item.name}>
          <span className="landing-testimonial-mark">“</span>
          <p>{item.quote}</p>
          <div><strong>{item.name}</strong><span>{item.role}</span></div>
        </article>)}
      </div>
    </div>
  </section>;
}
