import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StudyPlanRequest {
  studentName: string;
  subjects: string[];
  dailyStudyHours: number;
  totalDays: number;
  difficulty: "easy" | "medium" | "hard";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, subjects, dailyStudyHours, totalDays, difficulty }: StudyPlanRequest = await req.json();

    console.log("Generating study plan for:", { studentName, subjects, dailyStudyHours, totalDays, difficulty });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI study planner that creates detailed, practical study schedules.
    
Your task is to create a comprehensive day-by-day study plan following these rules:
1. Distribute workload evenly across all available days
2. Allocate MORE time to difficult subjects (if difficulty is "hard", prioritize challenging subjects)
3. Include 10-15 minute breaks after every 45-60 minutes of study
4. Make the schedule realistic and easy to follow
5. Start each day at a reasonable time (e.g., 9:00 AM)
6. Consider the difficulty level to adjust intensity:
   - Easy: More breaks, shorter sessions, lighter topics first
   - Medium: Balanced approach, mix of challenging and lighter topics
   - Hard: Intensive focus, longer sessions, tackle difficult topics when energy is highest

ALWAYS respond with valid JSON in this exact structure:
{
  "studentName": "string",
  "totalDays": number,
  "dailyHours": number,
  "difficulty": "string",
  "schedule": [
    {
      "day": 1,
      "date": "Day 1",
      "subjects": [
        {
          "subject": "Subject Name",
          "duration": "1h 30m",
          "startTime": "09:00",
          "endTime": "10:30"
        }
      ],
      "breaks": [
        { "duration": "15 min", "afterSubject": "Subject Name" }
      ],
      "totalStudyTime": "4h"
    }
  ],
  "summary": {
    "subjectAllocation": [
      { "subject": "Subject Name", "totalHours": 10, "percentage": 25 }
    ],
    "tips": [
      "Study tip 1",
      "Study tip 2",
      "Study tip 3"
    ]
  }
}`;

    const userPrompt = `Create a ${totalDays}-day study plan for ${studentName} with these details:

Subjects to study: ${subjects.join(", ")}
Daily study hours available: ${dailyStudyHours} hours
Total days available: ${totalDays} days
Difficulty/Intensity level: ${difficulty}

Generate a complete, structured study plan with specific time slots for each day. Include breaks and ensure balanced coverage of all subjects.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received, parsing...");

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    
    // Remove markdown code blocks if present - try multiple patterns
    if (jsonStr.includes("```")) {
      // Match ```json ... ``` or ``` ... ```
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      } else {
        // Fallback: just remove all backticks and "json" prefix
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```/g, '');
      }
    }
    
    // Trim whitespace
    jsonStr = jsonStr.trim();
    
    console.log("Cleaned JSON string (first 200 chars):", jsonStr.substring(0, 200));

    const plan = JSON.parse(jsonStr);

    console.log("Study plan generated successfully");

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating study plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate study plan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
