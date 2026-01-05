import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { StudyFormData, StudyPlan } from "@/types/studyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  subjects: z.string().min(3, "Please enter at least one subject"),
  dailyStudyHours: z.coerce.number().min(1, "Minimum 1 hour").max(12, "Maximum 12 hours"),
  totalDays: z.coerce.number().min(1, "Minimum 1 day").max(90, "Maximum 90 days"),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

interface StudyPlannerFormProps {
  onPlanGenerated: (plan: StudyPlan) => void;
}

const StudyPlannerForm = ({ onPlanGenerated }: StudyPlannerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      subjects: "",
      dailyStudyHours: 4,
      totalDays: 7,
      difficulty: "medium",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const subjects = values.subjects.split(",").map((s) => s.trim()).filter(Boolean);
      
      if (subjects.length === 0) {
        toast.error("Please enter at least one subject");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          studentName: values.studentName,
          subjects,
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

          <FormField
            control={form.control}
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjects</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Mathematics, Physics, Chemistry, Biology"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter subjects separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dailyStudyHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Study Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      {...field}
                    />
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
                    <Input
                      type="number"
                      min={1}
                      max={90}
                      {...field}
                    />
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
