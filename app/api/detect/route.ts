import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
      // This helps prevent Gemini from blocking your request for "sensitive" topics
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      systemInstruction: `You are an elite academic editor. Analyze text for 'bullshit'. Every finding must have: 1. 'type': Must be exactly 'filler', 'circular', or 'weak'. 2. 'severity': Must be exactly 'critical', 'warning', or 'suggestion'. 3. 'replacement': A grammatically perfect replacement that fits the original context. Severity Guidelines: - critical: Blatant nonsense or extreme wordiness that ruins the text. - warning: Repetitive or weak phrasing. - suggestion: Minor improvements for better flow. You shall not fact check ages or time periods as you are not aware when the text was or will be published. If parts of the text serve no purpose feel free to return a blank "" text as a replacement. Note that replacements need to be in the same language as the text you recieve. Return ONLY a JSON array of objects:  [{ "snippet": "...", "reason": "...", "type": "filler|circular|weak", "severity": "critical|warning|suggestion", "replacement": "..." }]`
    });

    const result = await model.generateContent(text);
    const response = await result.response;
    let data = JSON.parse(response.text());


    if (!Array.isArray(data)) {
      if (data.results) data = data.results;
      else if (data.suggestions) data = data.suggestions;
      else if (data.errors) data = data.errors;
      else data = [];
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}