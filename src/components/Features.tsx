import { Brain, Clock, Target, Zap, Calendar, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Planning",
    description: "Our intelligent algorithm creates optimized schedules based on your learning patterns and subject difficulty.",
  },
  {
    icon: Clock,
    title: "Smart Time Allocation",
    description: "Automatically distributes study time with built-in breaks to maximize retention and prevent burnout.",
  },
  {
    icon: Target,
    title: "Difficulty Adaptation",
    description: "Allocates more time to challenging subjects while ensuring balanced coverage across all topics.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get your complete study plan in seconds. No complex setup or lengthy questionnaires required.",
  },
  {
    icon: Calendar,
    title: "Day-by-Day Schedule",
    description: "Detailed daily breakdowns with specific time slots, subjects, and scheduled breaks.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visual overview of time allocation across subjects to help you stay on track.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-hero bg-clip-text text-transparent">Study Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered study planner adapts to your unique needs and creates 
            the perfect schedule for academic success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
