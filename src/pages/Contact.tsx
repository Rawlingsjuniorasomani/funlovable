import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, Phone, MapPin, Clock, HelpCircle } from "lucide-react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Click the 'Sign Up' button in the top right corner and fill out the registration form. You'll receive a confirmation email to verify your account.",
  },
  {
    question: "How can I track my child's progress?",
    answer: "Once logged in, access your parent dashboard to view detailed progress reports, quiz scores, attendance records, and more.",
  },
  {
    question: "What devices can my child use?",
    answer: "Our platform works on any device with a web browser - laptops, tablets, smartphones, and desktop computers.",
  },
  {
    question: "Are the live classes recorded?",
    answer: "Yes! All live classes are recorded and available for replay in your child's dashboard for up to 30 days.",
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel anytime from your account settings. Your access will continue until the end of your billing period.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      contactSchema.parse(formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Have questions or need help? We're here for you. Reach out and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div className="bg-card rounded-3xl p-8 border border-border">
                <h2 className="font-display text-2xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-bounce bg-gradient-to-r from-primary to-tertiary hover:opacity-90 py-6 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Contact Information</h2>
                  <p className="text-muted-foreground">
                    Reach out through any of these channels. We're here to help you every step of the way!
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Email</h4>
                      <p className="text-muted-foreground">info@funlovable.com</p>
                      <p className="text-muted-foreground">support@funlovable.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Phone</h4>
                      <p className="text-muted-foreground">+233 59 939 5735</p>
                      <p className="text-muted-foreground"></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                    <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-7 h-7 text-tertiary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Location</h4>
                      <p className="text-muted-foreground">Accra, Ghana</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                    <div className="w-14 h-14 rounded-xl bg-quaternary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-7 h-7 text-quaternary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Support Hours</h4>
                      <p className="text-muted-foreground">Monday - Friday: 8AM - 6PM</p>
                      <p className="text-muted-foreground">Saturday: 9AM - 3PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p className="text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
