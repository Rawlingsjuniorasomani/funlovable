import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { SubjectsPreview } from "@/components/home/SubjectsPreview";
import { PricingPreview } from "@/components/home/PricingPreview";
import { ContactSection } from "@/components/home/ContactSection";
import { HomepageChatbot } from "@/components/chat/HomepageChatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <SubjectsPreview />
        <PricingPreview />
        <ContactSection />
      </main>
      <Footer />
      <HomepageChatbot />
    </div>
  );
};

export default Index;
