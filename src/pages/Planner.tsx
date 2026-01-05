import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StudyPlannerForm from "@/components/StudyPlannerForm";
import StudyPlanResults from "@/components/StudyPlanResults";
import { StudyPlan } from "@/types/studyPlan";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Planner = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

  const handlePlanGenerated = (plan: StudyPlan) => {
    setStudyPlan(plan);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setStudyPlan(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            {studyPlan ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Create New Plan
              </Button>
            ) : null}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              {studyPlan ? "Your Study Plan" : "Create Your Study Plan"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {studyPlan
                ? "Here's your personalized AI-generated study schedule"
                : "Enter your study details below and let AI create a personalized schedule for you"}
            </p>
          </div>

          {/* Content */}
          {studyPlan ? (
            <StudyPlanResults plan={studyPlan} />
          ) : (
            <div className="max-w-2xl">
              <StudyPlannerForm onPlanGenerated={handlePlanGenerated} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Planner;
