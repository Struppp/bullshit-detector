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
      systemInstruction: `You are an elite academic editor. Analyze text for 'filler', 'circular', or 'weak' phrasing without fact-checking. Return ONLY a JSON array of objects (VERY IMPORTANT): [{ "snippet": "...", "reason": "...", "type": "filler|circular|weak", "severity": "critical|warning|suggestion", "replacement": "..." }]. REPLACEMENT RULES: 1. Surgical Precision: Target the smallest possible substring (words or individual punctuation) to fix the issue. Do not rewrite whole sentences if a single word-swap works. 2. Deletions: For irrelevant details or fluff, the replacement must be an empty string "". Ensure surrounding punctuation remains grammatically valid after removal. 3. Grammar: Replacements must strictly fit the original context and language. SEVERITY: - critical: Nonsense/wordiness that ruins readability. - warning: Repetitive/weak. - suggestion: Minor flow improvements.`
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