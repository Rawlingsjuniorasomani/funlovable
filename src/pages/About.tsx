import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Target, Eye, Heart, Users, Award, Lightbulb, Shield } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion for Learning",
    description: "We believe every child has unlimited potential waiting to be unlocked through engaging education.",
    color: "text-destructive bg-destructive/10",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously improve our platform with the latest educational technology and methods.",
    color: "text-accent bg-accent/10",
  },
  {
    icon: Users,
    title: "Community",
    description: "We build strong connections between students, parents, and teachers for collaborative learning.",
    color: "text-tertiary bg-tertiary/10",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "We maintain the highest standards of security and privacy for our young learners.",
    color: "text-secondary bg-secondary/10",
  },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                About <span className="gradient-text">Lovable Learn</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to transform children's education through technology,
                making learning accessible, engaging, and fun for every child.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Lovable Learn was founded with a simple yet powerful vision:
                    to make quality education accessible to every child, regardless of their location or background.
                  </p>
                  <p>
                    We understand the challenges parents face in finding reliable, engaging educational
                    content for their children. That's why we've created a comprehensive platform that
                    combines interactive lessons, live classes, and progress tracking tools.
                  </p>
                  <p>
                    Our team of educators, designers, and technologists work together to create
                    learning experiences that children love and parents trust.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/about-1.jpg"
                    alt="Mom and daughter learning together"
                    className="w-full h-full object-cover"
                  />
                  {/* Floating badge */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                    <p className="font-display font-bold text-center text-primary">Learning Together</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -z-10 top-[-20px] right-[-20px] w-full h-full rounded-3xl border-2 border-dashed border-primary/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide high-quality, interactive educational content that empowers children
                  to learn at their own pace while giving parents the tools to support their
                  educational journey.
                </p>
              </div>
              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the leading e-learning platform in Ghana and Africa, known for
                  transforming how children learn and preparing them for a successful future
                  in an ever-changing world.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our <span className="gradient-text">Values</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core values guide everything we do at Lovable Learn.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div key={value.title} className="bg-card rounded-2xl p-6 border border-border card-hover">
                  <div className={`w-14 h-14 rounded-xl ${value.color} flex items-center justify-center mb-4`}>
                    <value.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </div>
  );
};

export default About;
