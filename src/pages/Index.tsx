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
      <div className="pt-20">
        <div className="bg-orange-600 text-white text-xs sm:text-sm marquee">
          <div className="marquee-content py-2">
            Welcome to Lovable Learn Engaging online education for kids Live classes, Quizzes, Parent dashboard to track their children performance
          </div>
        </div>
        <main className="pt-0">
          <HeroSection />
          <AboutSection />
          <SubjectsPreview />
          <PricingPreview />
          <ContactSection />
        </main>
        <Footer />
        <HomepageChatbot />
      </div>
    </div>
  );
};

export default Index;
