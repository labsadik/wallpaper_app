export default function LandingAbout(){
  return <section className="border-b border-slate-200 bg-white">
    <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-14 sm:px-6 sm:py-18 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-20">
      <div><span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">About the platform</span><h2 className="mt-2 max-w-md text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">A quieter place for beautiful images.</h2></div>
      <div className="max-w-2xl text-[15px] leading-7 text-slate-600"><p>Some images are meant to be glanced at. Others are meant to stay with you. This platform is built for the second kind.</p><p className="mt-4">Publishers can build a recognizable profile, share their work, grow followers and let each item stand on its own. Visitors can browse without friction, then open an image for the complete story, publisher identity and actions.</p><p className="mt-5 border-l-2 border-slate-300 pl-4 font-bold text-slate-900">Find a frame worth keeping. Give it a title worth remembering. Let the right image find the right screen.</p></div>
    </div>
  </section>;
}