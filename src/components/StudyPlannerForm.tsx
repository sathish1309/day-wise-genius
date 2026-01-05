import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Plus, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StudyPlan } from "@/types/studyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  goals: z.string().max(500).optional(),
});

const formSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters").max(100),
  subjects: z.array(subjectSchema).min(1, "Add at least one subject"),
  dailyStudyHours: z.coerce.number().min(1, "Minimum 1 hour").max(12, "Maximum 12 hours"),
  totalDays: z.coerce.number().min(1, "Minimum 1 day").max(90, "Maximum 90 days"),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

type FormValues = z.infer<typeof formSchema>;

interface StudyPlannerFormProps {
  onPlanGenerated: (plan: StudyPlan) => void;
}

const StudyPlannerForm = ({ onPlanGenerated }: StudyPlannerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      subjects: [{ name: "", goals: "" }],
      dailyStudyHours: 4,
      totalDays: 7,
      difficulty: "medium",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const validSubjects = values.subjects
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          goals: s.goals?.trim() || "",
        }));

      if (validSubjects.length === 0) {
        toast.error("Please enter at least one subject");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          studentName: values.studentName,
          subjects: validSubjects,
          dailyStudyHours: values.dailyStudyHours,
          totalDays: values.totalDays,
          difficulty: values.difficulty,
        },
      });

      if (error) {
        console.error("Error generating plan:", error);
        if (error.message?.includes("429")) {
          toast.error("Too many requests. Please try again in a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("AI credits depleted. Please add credits to continue.");
        } else {
          toast.error("Failed to generate study plan. Please try again.");
        }
        return;
      }

      if (data?.plan) {
        onPlanGenerated(data.plan);
        toast.success("Study plan generated successfully!");
      } else {
        toast.error("Invalid response from AI. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">Study Details</h2>
          <p className="text-sm text-muted-foreground">Fill in your study information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subjects with Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base">Subjects & Goals</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", goals: "" })}
                disabled={fields.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Subject
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-border rounded-xl bg-muted/30 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`subjects.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Subject name (e.g., Mathematics)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subjects.${index}.goals`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Goals: Chapters, topics, or specific areas to cover (e.g., Chapters 1-5: Algebra, Quadratic equations, Polynomials)"
                                className="min-h-[60px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Optional: Add chapters or topics for smarter time allocation
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {form.formState.errors.subjects?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.subjects.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dailyStudyHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Study Hours</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={12} {...field} />
                  </FormControl>
                  <FormDescription>Hours per day (1-12)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Days Available</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={90} {...field} />
                  </FormControl>
                  <FormDescription>Number of days (1-90)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Light Study Load</SelectItem>
                    <SelectItem value="medium">Medium - Balanced Approach</SelectItem>
                    <SelectItem value="hard">Hard - Intensive Preparation</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose based on your exam/goal intensity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Study Plan
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default StudyPlannerForm;
