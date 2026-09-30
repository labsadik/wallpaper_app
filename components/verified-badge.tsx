export default function VerifiedBadge({label="Verified publisher"}:{label?:string}){
  return <span className="verified-badge" title={label} aria-label={label}>✓</span>;
}
