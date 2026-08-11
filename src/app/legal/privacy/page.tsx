export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl">
      <h1 className="text-4xl font-heading font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-lg max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Introduction</h2>
        <p>Welcome to PC Guide Pro. We respect your privacy and are committed to protecting your personal data.</p>
        <h2>2. Data Collection</h2>
        <p>We do not collect any personally identifiable information unless you explicitly provide it (e.g., through a contact form or newsletter signup).</p>
      </div>
    </div>
  );
}
