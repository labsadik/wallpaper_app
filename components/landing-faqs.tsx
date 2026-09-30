const FAQS=[
  ["Can I browse without an account?","Yes. Published items can be discovered and opened publicly. An account is required for actions such as liking, saving and downloading."],
  ["Can publishers choose the target device?","Yes. Each upload is assigned to one target device version—PC, Tablet or Mobile—and the stored image keeps its natural proportions."],
  ["How does sharing work?","Every published item has a share action. Successful shares are counted on the item detail page, alongside likes, saves and downloads."],
  ["What appears on a public profile?","A public profile can show the publisher name, username, avatar, verification status, followers, following, published item total and total downloads, without exposing private account details."],
  ["Are media URLs exposed directly?","No. The application uses same-origin signed media delivery instead of placing the Bunny origin URL in the public UI."]
] as const;

export default function LandingFaqs(){
  return <section className="landing-faq-section">
    <div className="container landing-faq-grid">
      <div>
        <span className="landing-kicker">FAQ</span>
        <h2>Questions, answered simply.</h2>
      </div>
      <div className="landing-faq-list">
        {FAQS.map(([question,answer])=><details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
