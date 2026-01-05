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

    const systemPromptWithTools = `${systemPrompt}

IMPORTANT:
- You MUST call the tool "generate_study_plan" to produce the response.
- Do NOT wrap anything in \`\`\` fences.
- Do NOT include extra commentary outside the tool call.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_study_plan",
          description:
            "Generate a day-by-day study plan with time blocks, breaks, and a summary allocation.",
          parameters: {
            type: "object",
            properties: {
              studentName: { type: "string" },
              totalDays: { type: "number" },
              dailyHours: { type: "number" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
              schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    date: { type: "string" },
                    subjects: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          subject: { type: "string" },
                          duration: { type: "string" },
                          startTime: { type: "string" },
                          endTime: { type: "string" },
                        },
                        required: ["subject", "duration", "startTime", "endTime"],
                        additionalProperties: false,
                      },
                    },
                    breaks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          duration: { type: "string" },
                          afterSubject: { type: "string" },
                        },
                        required: ["duration", "afterSubject"],
                        additionalProperties: false,
                      },
                    },
                    totalStudyTime: { type: "string" },
                  },
                  required: ["day", "date", "subjects", "breaks", "totalStudyTime"],
                  additionalProperties: false,
                },
              },
              summary: {
                type: "object",
                properties: {
                  subjectAllocation: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        subject: { type: "string" },
                        totalHours: { type: "number" },
                        percentage: { type: "number" },
                      },
                      required: ["subject", "totalHours", "percentage"],
                      additionalProperties: false,
                    },
                  },
                  tips: { type: "array", items: { type: "string" } },
                },
                required: ["subjectAllocation", "tips"],
                additionalProperties: false,
              },
            },
            required: [
              "studentName",
              "totalDays",
              "dailyHours",
              "difficulty",
              "schedule",
              "summary",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPromptWithTools },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_study_plan" } },
        temperature: 0.2,
        max_tokens: 8000,
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
    const message = data.choices?.[0]?.message;

    let plan: unknown;

    // Preferred: tool calling (reliable structured output)
    const toolArgs = message?.tool_calls?.[0]?.function?.arguments;
    if (toolArgs) {
      plan = typeof toolArgs === "string" ? JSON.parse(toolArgs) : toolArgs;
      console.log("Study plan parsed from tool call");
    } else {
      // Fallback: content parsing (best effort)
      const content = message?.content;
      if (!content) {
        console.error(
          "AI response missing both tool_calls and content (first 1k chars):",
          JSON.stringify(data).slice(0, 1000)
        );
        throw new Error("AI response did not include a study plan");
      }

      console.log("AI response received (fallback content), parsing...");

      let jsonStr = content;

      // Remove markdown code blocks if present
      if (jsonStr.includes("```")) {
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1];
        } else {
          jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```/g, "");
        }
      }

      jsonStr = jsonStr.trim();

      // Extra cleanup: take only the outermost JSON object if the model adds text
      const firstBrace = jsonStr.indexOf("{");
      const lastBrace = jsonStr.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }

      console.log(
        "Cleaned JSON string (first 200 chars):",
        jsonStr.substring(0, 200)
      );

      plan = JSON.parse(jsonStr);
    }

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
