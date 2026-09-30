export default function ItemsSkeleton(){
  return <main className="items-page" aria-busy="true" aria-label="Loading items">
    <section className="container items-page-head items-skeleton-head">
      <div className="skeleton-line items-skeleton-kicker"/>
      <div className="skeleton-line items-skeleton-title"/>
      <div className="skeleton-line items-skeleton-copy"/>
      <div className="skeleton-line items-skeleton-search"/>
      <div className="items-skeleton-pills">
        {Array.from({length:7},(_,index)=><div className="skeleton-line items-skeleton-pill" key={index}/>)}
      </div>
    </section>
    <section className="container items-feed">
      <div className="pinterest-masonry items-skeleton-masonry">
        {Array.from({length:14},(_,index)=><div className="items-skeleton-tile skeleton-card" key={index}/>)}
      </div>
    </section>
  </main>;
}
