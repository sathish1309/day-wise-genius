import { Calendar, Clock, BookOpen, Coffee, TrendingUp, Download, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudyPlan } from "@/types/studyPlan";
import { useState } from "react";

interface StudyPlanResultsProps {
  plan: StudyPlan;
}

const StudyPlanResults = ({ plan }: StudyPlanResultsProps) => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const downloadPlan = () => {
    let content = `STUDY PLAN FOR ${plan.studentName.toUpperCase()}\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `Duration: ${plan.totalDays} days | Daily Hours: ${plan.dailyHours}h | Difficulty: ${plan.difficulty}\n\n`;

    content += `SUBJECT ALLOCATION\n${"-".repeat(30)}\n`;
    plan.summary.subjectAllocation.forEach((s) => {
      content += `• ${s.subject}: ${s.totalHours}h (${s.percentage}%)\n`;
    });

    content += `\nDAILY SCHEDULE\n${"-".repeat(30)}\n`;
    plan.schedule.forEach((day) => {
      content += `\nDay ${day.day} - ${day.date}\n`;
      day.subjects.forEach((block) => {
        const topicStr = block.topic ? ` - ${block.topic}` : "";
        content += `  ${block.startTime} - ${block.endTime}: ${block.subject}${topicStr} (${block.duration})\n`;
      });
      if (day.breaks.length > 0) {
        content += `  Breaks: ${day.breaks.map((b) => `${b.duration} after ${b.afterSubject}`).join(", ")}\n`;
      }
    });

    content += `\nSTUDY TIPS\n${"-".repeat(30)}\n`;
    plan.summary.tips.forEach((tip, i) => {
      content += `${i + 1}. ${tip}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-plan-${plan.studentName.toLowerCase().replace(/\s/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">
              {plan.studentName}'s Study Plan
            </h2>
            <p className="text-muted-foreground">
              {plan.totalDays} days • {plan.dailyHours}h/day • {plan.difficulty} difficulty
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "cards" ? "bg-card shadow-sm" : ""
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table" ? "bg-card shadow-sm" : ""
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={downloadPlan}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Subject Allocation Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {plan.summary.subjectAllocation.map((subject, i) => (
            <div
              key={i}
              className="bg-muted/50 rounded-xl p-4"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm truncate">{subject.subject}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold">{subject.totalHours}h</span>
                <span className="text-sm text-muted-foreground">{subject.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      {viewMode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plan.schedule.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="bg-card rounded-2xl shadow-card p-5 hover:shadow-elevated transition-shadow"
              style={{ animationDelay: `${dayIndex * 50}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Day {day.day}</h3>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
              </div>

              <div className="space-y-2">
                {day.subjects.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{block.subject}</p>
                      {block.topic && (
                        <p className="text-xs text-accent-foreground truncate">{block.topic}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {block.startTime} - {block.endTime}
                      </p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {block.duration}
                    </span>
                  </div>
                ))}

                {day.breaks.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                    <Coffee className="w-4 h-4" />
                    <span>
                      {day.breaks.length} break{day.breaks.length > 1 ? "s" : ""} scheduled
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total study time</span>
                  <span className="font-semibold">{day.totalStudyTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Day</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Schedule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plan.schedule.map((day, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Day {day.day}</td>
                    <td className="px-6 py-4 text-muted-foreground">{day.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {day.subjects.map((block, j) => (
                          <span
                            key={j}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
                            title={block.topic || undefined}
                          >
                            {block.subject}{block.topic ? `: ${block.topic}` : ""} ({block.startTime})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{day.totalStudyTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Study Tips</h3>
            <p className="text-sm text-muted-foreground">Personalized recommendations</p>
          </div>
        </div>

        <ul className="space-y-3">
          {plan.summary.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full gradient-hero flex items-center justify-center text-xs text-primary-foreground font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-muted-foreground">{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudyPlanResults;
