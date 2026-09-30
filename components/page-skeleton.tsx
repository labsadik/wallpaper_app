import PageShell from "@/components/page-shell";

export default function PageSkeleton(){
  return <PageShell eyebrow="Loading" title="" description="">
    <div className="skeleton-page" aria-busy="true" aria-label="Loading">
      <div className="skeleton-line skeleton-title"/>
      <div className="skeleton-line skeleton-subtitle"/>
      <div className="skeleton-toolbar">
        <div className="skeleton-line skeleton-chip"/>
        <div className="skeleton-line skeleton-chip"/>
        <div className="skeleton-line skeleton-chip"/>
      </div>
      <div className="skeleton-grid">
        {Array.from({length:8},(_,index)=><div className="skeleton-card" key={index}/>)}
      </div>
    </div>
  </PageShell>;
}
