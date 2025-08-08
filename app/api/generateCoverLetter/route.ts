import { NextRequest, NextResponse } from "next/server";

// API route to generate a personalized cover letter using OpenAI. It accepts
// a JSON payload with `jobTitle`, `company`, and `details` fields and returns
// a draft letter. The OpenAI API key must be stored in OPENAI_API_KEY.
export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, details } = await req.json();
    if (!jobTitle || !company) {
      return NextResponse.json({ error: "Job title and company are required" }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Compose a prompt instructing the AI to write a compelling cover letter. Include
    // the job title, company name, and any additional details provided by the user.
    const prompt = `Write a persuasive cover letter for the position of ${jobTitle} at ${company}. ` +
      `Highlight how the applicant's skills and experience make them a great fit. ` +
      `Use a friendly yet professional tone. Incorporate the following details if relevant: ${details || ""}.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert career coach and writer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `OpenAI API error: ${error}` }, { status: 500 });
    }
    const json = await response.json();
    const result = json?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}