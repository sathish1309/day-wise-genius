import { BookOpen, Brain, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Study Planning
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master Your Studies with{" "}
              <span className="gradient-hero bg-clip-text text-transparent">
                Intelligent Planning
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              Generate personalized, day-by-day study schedules tailored to your subjects, 
              available time, and learning goals. Study smarter, not harder.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/planner">
                <Button variant="hero" size="xl">
                  <Calendar className="w-5 h-5" />
                  Create Study Plan
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                <BookOpen className="w-5 h-5" />
                Learn More
              </Button>
            </div>
          </div>

          {/* Right illustration */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main card */}
              <div className="bg-card rounded-2xl shadow-elevated p-6 animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Today's Schedule</h3>
                    <p className="text-sm text-muted-foreground">5 hours planned</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { subject: "Mathematics", time: "9:00 - 10:30", color: "bg-primary/10 text-primary" },
                    { subject: "Physics", time: "11:00 - 12:30", color: "bg-secondary text-secondary-foreground" },
                    { subject: "Chemistry", time: "14:00 - 15:00", color: "bg-accent/10 text-accent-foreground" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${item.color.split(' ')[0]}`} />
                        <span className="font-medium">{item.subject}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-secondary rounded-xl px-4 py-2 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                <span className="text-sm font-medium text-secondary-foreground">✓ Break at 10:30</span>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl px-4 py-2 shadow-card animate-float" style={{ animationDelay: "2s" }}>
                <span className="text-sm font-medium">📊 Progress: 68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
