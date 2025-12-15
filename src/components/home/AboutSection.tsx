const features = [{
  image: "/images/interactive-lessons.png",
  title: "Interactive Lessons",
  description: "Engaging multimedia content that makes learning fun and memorable for every child."
}, {
  image: "/images/assignments-quizzes.png",
  title: "Assignments & Quizzes",
  description: "Regular assessments with instant feedback to track progress and reinforce learning."
}, {
  image: "/images/live-classes.png",
  title: "Live Classes",
  description: "Real-time sessions with qualified teachers for personalized guidance and support."
}, {
  image: "/images/parent-dashboard.png",
  title: "Parent Dashboard",
  description: "Monitor your child's progress, attendance, and performance in real-time."
}];
export function AboutSection() {
  return (
    <section id="about" className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/about-1.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">Lovable Learning?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We provide a comprehensive learning experience that combines the best of technology
            with proven educational methods to help your child excel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => <div key={feature.title} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-primary/10 card-hover animate-fade-in group hover:bg-white" style={{
            animationDelay: `${index * 0.1}s`
          }}>
            <div className="w-full aspect-square relative mb-6 rounded-xl overflow-hidden bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
              <img src={feature.image} alt={feature.title} className="w-4/5 h-4/5 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-display font-semibold text-xl mb-2 text-primary">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>)}
        </div>

        {/* Mission Statement */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-orange-100 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-slate-900">
                Our Mission
              </h3>
              <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                Our mission is to provide a simplified, accessible, and high-quality digital learning experience for students while empowering parents, teachers, and schools with the tools they need to track progress, manage learning, and deliver personalized education.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed">
                We aim to connect families and educators through a unified platform where lessons, assignments, live classes, assessments, and performance insights flow seamlessly.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                By leveraging technology, we make learning flexible, engaging, and affordable—ensuring that every child receives the support, guidance, and resources needed to succeed academically and confidently in a modern world.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50/50 rounded-xl p-6 text-center border border-orange-100">
                <div className="text-4xl font-bold text-orange-600 mb-1">

                </div>
                <p className="text-sm text-slate-500 font-medium">Verified Teachers</p>
              </div>
              <div className="bg-orange-50/50 rounded-xl p-6 text-center border border-orange-100">
                <div className="text-4xl font-bold text-orange-600 mb-1">

                </div>
                <p className="text-sm text-slate-500 font-medium">Courses Available</p>
              </div>
              <div className="bg-orange-50/50 rounded-xl p-6 text-center border border-orange-100">
                <div className="text-4xl font-bold text-orange-600 mb-1">

                </div>
                <p className="text-sm text-slate-500 font-medium">Happy Students</p>
              </div>
              <div className="bg-orange-50/50 rounded-xl p-6 text-center border border-orange-100">
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  4.9
                </div>
                <p className="text-sm text-slate-500 font-medium">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}