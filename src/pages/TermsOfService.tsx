import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 prose prose-slate max-w-3xl">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account or using the Lovable Learn platform, you agree to these Terms of Service.
            </p>

            <h2>2. Accounts & Access</h2>
            <p>
              Users include parents, students, teachers, and administrators. You are responsible for maintaining
              the confidentiality of your login credentials and for all activities under your account.
            </p>

            <h2>3. Content & Usage</h2>
            <p>
              Educational content is provided for learning purposes. Do not redistribute or republish content
              without permission. Misuse of services may result in account suspension.
            </p>

            <h2>4. Payments & Subscriptions</h2>
            <p>
              Payments for plans are processed securely via our payment partners. Subscription terms and billing
              cycles are disclosed during checkout. Failed payments may limit access to premium features.
            </p>

            <h2>5. Termination</h2>
            <p>
              We may suspend or terminate accounts that violate these terms or applicable laws. You may request account
              deletion by contacting support.
            </p>

            <h2>6. Changes to Terms</h2>
            <p>
              We may update these Terms periodically. Continued use after changes constitutes acceptance.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;

