export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl">
      <h1 className="text-4xl font-heading font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-lg max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Terms</h2>
        <p>By accessing this website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials on PC Guide Pro for personal, non-commercial transitory viewing only.</p>
      </div>
    </div>
  );
}
