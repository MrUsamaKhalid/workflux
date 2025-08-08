import { NextRequest, NextResponse } from "next/server";

// This API route generates an AI-enhanced resume using OpenAI's chat API. It expects a
// JSON payload with a `resume` field containing the user's raw resume text or
// job history. It returns a JSON response with a single field `result`, which
// contains the rewritten resume. The OpenAI API key must be provided via
// an environment variable named OPENAI_API_KEY. Note: This route is executed
// on the server, so the key is never exposed to the client.

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();
    if (!resume || typeof resume !== "string") {
      return NextResponse.json({ error: "Invalid resume content" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Compose a prompt instructing the AI to rewrite the resume in a professional,
    // ATS-friendly format. Encourage bullet points and clear section headings.
    const prompt = `You are an expert resume writer. Rewrite the following resume in a professional, ATS-friendly tone. Use bullet points to highlight achievements and skills. Keep the original content but improve clarity and impact.\n\nResume:\n${resume}\n\nRewritten Resume:`;

    // Call the OpenAI API using fetch. We avoid installing the openai SDK to
    // minimize dependencies and instead use the Fetch API directly. For
    // reference on the expected request body see:
    // https://platform.openai.com/docs/api-reference/chat/create
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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