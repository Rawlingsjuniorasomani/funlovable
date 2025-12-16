import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 prose prose-slate max-w-3xl">
            <h2>1. Information We Collect</h2>
            <p>
              We collect account details (name, email), usage data (progress, quiz attempts), and payment information
              where applicable. We do not store full payment card details.
            </p>

            <h2>2. How We Use Information</h2>
            <p>
              To provide and improve educational services, personalize learning, process payments, and communicate
              with users about platform updates and support.
            </p>

            <h2>3. Data Protection</h2>
            <p>
              We use industry-standard security controls and encrypted connections. Access to personal data is limited
              to authorized personnel.
            </p>

            <h2>4. Children’s Privacy</h2>
            <p>
              Parents manage child accounts. We limit the collection of personal data for child users and provide progress
              visibility tools to parents.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You can request access, correction, or deletion of your personal data by contacting support.
            </p>

            <h2>6. Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated through the platform.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

