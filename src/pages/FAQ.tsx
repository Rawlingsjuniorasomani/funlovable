import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">Find quick answers to common questions</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>How do I create a parent account?</AccordionTrigger>
                <AccordionContent>
                  Click Register on the homepage, choose Parent, and complete the onboarding steps.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How can students access lessons?</AccordionTrigger>
                <AccordionContent>
                  After enrolling in a subject, students can access lessons from the Student dashboard or Subjects page.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>How are payments processed?</AccordionTrigger>
                <AccordionContent>
                  Payments are processed via secure partners. After checkout, you will receive a confirmation and access to premium features.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>Can teachers create quizzes?</AccordionTrigger>
                <AccordionContent>
                  Yes. Teachers can create and manage quizzes from the Teacher dashboard under Quizzes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;

