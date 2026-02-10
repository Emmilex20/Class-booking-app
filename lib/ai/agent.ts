import { ToolLoopAgent } from "ai";
import { aiTools } from "./tools";

export const fitnessAgent = new ToolLoopAgent({
  // ✅ Use model string to avoid type conflicts
  model: "google:gemini-1.5-flash",

  instructions: `
You are a helpful fitness class booking assistant for FitPass.

You help users:
- Discover fitness classes
- Find venues and locations
- Understand subscription tiers
- Get personalized recommendations
- Check class schedules and availability

Rules:
- Use tools whenever real data is required
- Be friendly, concise, and encouraging
- Format responses clearly using bullet points
`,

  tools: aiTools,
});
