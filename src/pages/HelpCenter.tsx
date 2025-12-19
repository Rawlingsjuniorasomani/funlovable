import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Search, LifeBuoy, Mail, Phone, MessageSquare } from "lucide-react";

const HelpCenter = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Help Center
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Get answers quick. Search common questions or contact our support team.
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search help topics..." className="pl-10 h-12" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-primary" /> Get Support</CardTitle>
                <CardDescription>Reach our friendly team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" /> info@funlovable.com
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" /> +233 59 939 5735
                </div>
                <Button variant="outline" className="w-full"><MessageSquare className="w-4 h-4 mr-2" /> Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>Quick help for common actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do parents add a child?</AccordionTrigger>
                    <AccordionContent>
                      Go to Parent dashboard → Children → Add Child. Fill name, email and grade, then submit.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do students enroll in a subject?</AccordionTrigger>
                    <AccordionContent>
                      Open the Subjects page, select a subject and click Enroll. You must be signed in as a student.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do teachers create lessons?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to Teacher dashboard → Lessons. Use “New Lesson” to add content or upload files.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;

