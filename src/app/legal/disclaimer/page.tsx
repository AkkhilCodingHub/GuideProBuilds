export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl">
      <h1 className="text-4xl font-heading font-bold mb-8">Affiliate Disclaimer</h1>
      <div className="prose prose-invert prose-lg max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>Affiliate Links</h2>
        <p>Some of the links on this website are affiliate links. This means that, at zero cost to you, PC Guide Pro will earn an affiliate commission if you click through the link and finalize a purchase.</p>
        <h2>Product Recommendations</h2>
        <p>We only recommend products and services that we believe will add value to our readers. All opinions are our own.</p>
      </div>
    </div>
  );
}
